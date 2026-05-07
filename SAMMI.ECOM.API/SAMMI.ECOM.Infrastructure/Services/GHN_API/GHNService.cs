using Microsoft.Extensions.Configuration;
using SAMMI.ECOM.Domain.DomainModels.Shipping;
using System.Net.Http.Json;

namespace SAMMI.ECOM.Infrastructure.Services.GHN_API
{
    public interface IGHNService
    {
        Task<List<ProvinceDTO>> GetProvinces();
        Task<List<DistrictDTO>> GetDistricts(int provinceId);
        Task<List<WardDTO>> GetWards(int districtId);
        Task<List<ServiceDTO>> GetServices(int fromDistrictId, int toDistrictId);
        Task<FeeResponseDTO> CalculateFee(FeeRequestDTO request);
    }
    public class GHNService : IGHNService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        public GHNService(
            IHttpClientFactory httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient.CreateClient();
            _config = configuration.GetSection("GHN_API");
            _httpClient.DefaultRequestHeaders.Add("token", _config.GetValue<string>("Token"));
        }

        public async Task<FeeResponseDTO> CalculateFee(FeeRequestDTO request)
        {
            var fromDistrictId = _config.GetValue<int>("DistrictId");
            request.ServiceID = (await GetServices(fromDistrictId, request.ToDistrictID)).SingleOrDefault(x => x.ServiceTypeID == 2).ServiceID;
            request.Weight = 800;
            request.Width = 15;
            request.Length = 15;
            request.Height = 15;
            request.InnsuranceValue = request.InnsuranceValue == 0 || request.InnsuranceValue == null
                                    ? 100000
                                    : request.InnsuranceValue;
            var requestBody = new
            {
                insurance_value = request.InnsuranceValue,
                to_district_id = request.ToDistrictID,
                to_ward_code = request.ToWardCode,
                service_id = request.ServiceID,
                weight = request.Weight,
                length = request.Length,
                width = request.Width,
                height = request.Height
            };
            _httpClient.DefaultRequestHeaders.Add("shop_id", _config.GetValue<int>("ShopId").ToString());
            var response = await _httpClient.PostAsJsonAsync($"{_config.GetValue<string>("BaseUrl")}v2/shipping-order/fee", requestBody);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<GHNResponse<FeeResponseDTO>>();

            var leadtimeRequest = new
            {
                service_id = request.ServiceID,
                from_district_id = fromDistrictId,
                to_district_id = request.ToDistrictID,
                to_ward_code = request.ToWardCode
            };
            var leadtimeResponse = await _httpClient.PostAsJsonAsync($"{_config.GetValue<string>("BaseUrl")}v2/shipping-order/leadtime", leadtimeRequest);
            leadtimeResponse.EnsureSuccessStatusCode();
            var leadtimeResult = await leadtimeResponse.Content.ReadFromJsonAsync<GHNResponse<LeadTimeResponseDTO>>();

            result.Data.LeadTime = DateTimeOffset.FromUnixTimeSeconds(leadtimeResult.Data.Leadtime).UtcDateTime.AddHours(7);
            return result?.Data ?? null;
        }

        public async Task<List<DistrictDTO>> GetDistricts(int provinceId)
        {
            var provinceRes = await _httpClient.GetAsync($"{_config.GetValue<string>("BaseUrl")}master-data/district?province_id={provinceId}");
            provinceRes.EnsureSuccessStatusCode();
            var result = await provinceRes.Content.ReadFromJsonAsync<GHNResponse<List<DistrictDTO>>>();
            return result?.Data ?? null;
        }

        public async Task<List<ProvinceDTO>> GetProvinces()
        {
            var provinceRes = await _httpClient.GetAsync($"{_config.GetValue<string>("BaseUrl")}master-data/province");
            provinceRes.EnsureSuccessStatusCode();
            var result = await provinceRes.Content.ReadFromJsonAsync<GHNResponse<List<ProvinceDTO>>>();
            return result?.Data ?? null;
        }

        public async Task<List<ServiceDTO>> GetServices(int fromDistrictId, int toDistrictId)
        {
            var request = new
            {
                shop_id = _config.GetValue<int>("ShopId"),
                from_district = fromDistrictId,
                to_district = toDistrictId
            };
            var response = await _httpClient.PostAsJsonAsync($"{_config.GetValue<string>("BaseUrl")}v2/shipping-order/available-services", request);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<GHNResponse<List<ServiceDTO>>>();
            return result?.Data ?? null;
        }

        public async Task<List<WardDTO>> GetWards(int districtId)
        {
            var provinceRes = await _httpClient.GetAsync($"{_config.GetValue<string>("BaseUrl")}master-data/ward?district_id={districtId}");
            provinceRes.EnsureSuccessStatusCode();
            var result = await provinceRes.Content.ReadFromJsonAsync<GHNResponse<List<WardDTO>>>();
            return result?.Data ?? null;
        }
    }
}
