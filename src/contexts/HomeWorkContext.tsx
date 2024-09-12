import { useState, ReactNode, createContext } from 'react';
type HomeWorkContext = {
  //  sidebarToggle
  handleHomeworkInfo: (table_id: Number, school_id: Number, class_id: Number, section_id: Number, academic_year_id: any, student_id: Number) => void;
  school_id: Number | null;
  class_id: Number | null;
  section_id: Number | null;
  academic_year_id: any;
  student_id: Number | null;
  table_id: Number | null;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HomeworkContext = createContext<HomeWorkContext>({} as HomeWorkContext);

type Props = {
  children: ReactNode;
};

export function HomeworkProvider({ children }: Props) {
  const [school_id, setSchoolId] = useState(null);
  const [class_id, setClassId] = useState(null);
  const [section_id, setSectionId] = useState(null);
  const [academic_year_id, setAcademicYearId] = useState(null);
  const [student_id, setStudentId] = useState(null);
  const [table_id, setTableId] = useState(null);
  //   const toggleSidebar = () => {
  //     setSidebarToggle(value => !value);
  //   };

  const handleHomeworkInfo = (table_id, school_id, class_id, section_id, academic_year_id, student_id) => {
    setSchoolId(school_id);
    setClassId(class_id);
    setSectionId(section_id);
    setAcademicYearId(academic_year_id);
    setStudentId(student_id);
    setTableId(table_id);
  };
  return (
    <HomeworkContext.Provider value={{ table_id, school_id, class_id, section_id, academic_year_id, student_id, handleHomeworkInfo }}>
      {children}
    </HomeworkContext.Provider>
  );
}
