import axios from 'axios';
import { useState, ReactNode, createContext } from 'react';

type HighestStdIdContext = {
    highestStudentId: any;
    handleFetchHighestStudentId: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HighestStudentIdContext = createContext<HighestStdIdContext>({} as HighestStdIdContext);

type Props = {
    children: ReactNode;
};

export function HighestStudentIdProvider({ children }: Props) {
    const [highestStudentId, setHighestStudentId] = useState();

    // useEffect(() => {
    const handleFetchHighestStudentId = async () => {
        try {
            const response = await axios.get('/api/student/highest_student_id');
            console.log({ response })
            setHighestStudentId(response.data.highestStudentId);
        } catch (err) {
            // setError(err);
            console.error('Error fetching highest student ID:', err);
        } finally {
            // setLoading(false);
        }
    };
    // fetchData();
    // }, []);

    // useEffect(() => {
    //     // const curModuleName = window.localStorage.getItem('moduleName') || '';
    //     setHighestStudentId(curModuleName);
    //     // if (!curModuleName) handleDrawerClose();
    // }, []);

    //   const handleChangeModule = (value) => {
    //     setSelectModule(value);
    //     window.localStorage.setItem('moduleName', value);
    //   };


    return (
        <HighestStudentIdContext.Provider value={{ highestStudentId, handleFetchHighestStudentId }}>
            {children}
        </HighestStudentIdContext.Provider>
    );
}
