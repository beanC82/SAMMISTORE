import React from 'react';
import Button from '@mui/material/Button';
import * as XLSX from 'xlsx';

const ExportToExcel = () => {
  const data = [
    ['Tên', 'Tuổi', 'Địa chỉ'],
    ['Nguyễn Văn A', 25, 'Hà Nội'],
    ['Trần Thị B', 30, 'Hồ Chí Minh'],
    ['Lê Văn C', 28, 'Đà Nẵng'],
  ];

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'DanhSach.xlsx');
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={exportToExcel}>
        Xuất Excel
      </Button>
    </div>
  );
};

export default ExportToExcel;