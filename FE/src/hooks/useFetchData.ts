import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/stores';

const useFetchData = (action: any, selector: any, filter: any) => {
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(action(filter));
      setLoading(false);
    };

    fetchData();
  }, [dispatch, action, filter]);

  return { data, loading };
};

export default useFetchData;