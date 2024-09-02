"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
const classList = [
    {
        name: "EB - One",
        id: 1
    },
    {
        name: "EB Two",
        id: 2
    },
    {
        name: "EB Three",
        id: 3
    },
    {
        name: "EB Four",
        id: 4
    },
    {
        name: "EB Five",
        id: 5
    },
    {
        name: "Six",
        id: 6
    },
    {
        name: "Seven",
        id: 7
    },
    {
        name: "Eight",
        id: 8
    },
    {
        name: "Nine",
        id: 9
    },
    {
        name: "Ten",
        id: 10
    },
    {
        name: "Alim 1st",
        id: 11
    },
    {
        name: "Alim  2nd",
        id: 12
    },
    {
        name: "Fazil 1st",
        id: 13
    },
    {
        name: "Fazil 2nd",
        id: 14
    },
    {
        name: "Fazil 3rd",
        id: 15
    },
    {
        name: "Kamil 1st",
        id: 16
    },
    {
        name: "Kamil 2nd",
        id: 17
    },
    {
        name: "Play",
        id: 18
    }, {
        name: "One",
        id: 19
    },
]

const student = [

    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/b554ba964a60612c01c50276cb3faf37.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/25a3e6187e1b500671e27f39aa76222f.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/321c6bcad9f3e7bb6ba66982811094bb.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/c138f7e8c836b77fcd10c07fe9b4f5ca.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/85f93940a91377df98fdd5bd9dff35e6.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/a519567c89cbaea45228c3bc8bf37e33.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/887c5348bcf2200e89a33e8177c566cd.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/2ca487edcdb888d01781f56a3b01e1a1.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/deb403e0cf8f149c858bef246a7f9bbe.jpg',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/906dccf7f029649d1d0bd7396ad8d533.jpg',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/4f33c3f7eb11454904cc8ed00992513a.jpg',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ed771e781c7585dad553ad08bdde6791.png.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
    {
        name: "Shadia Akter Surna",
        RollNo: "213", imgUrl: 'https://demo.edusofto.com.bd/uploads/images/student/ef209ce0696d29696bec0f6c81597758.png',
        RegisterNo: '2000'
    },
]
const StudentClass = ({ params }) => {

    const [classes, setClasses] = useState([]);

    useEffect(() => {
        console.log(params.class_id);
        setClasses(student.slice(0, parseInt(params.class_id)))
    }, [params])

    return (
        <div>
            <div className=' h-20 bg-slate-300 pt-3 m-4 font-bold'>
                <h2 className=' text-center'>Class name : {classList.find(i => i.id == parseInt(params.class_id))?.name}</h2>
                <h2 className=' pl-7'> Total Student : {classes.length}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 justify-center pt-6 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 ">
                {
                    classes.map(i =>
                        <div key={i.id} className="shadow-md p-4 flex justify-between flex-col">

                            <Image
                                height={500}
                                width={500}
                                quality={100}
                                className="w-full object-cover h-80"
                                src={i.imgUrl}
                                loading="lazy"
                                alt={""}
                            />

                            <div className='grid place-content-center text-center bg-slate-300 p-2'>
                                <h2 className='font-bold'>{i.name}
                                </h2>
                                <h3>Roll no : {i.RollNo}</h3>
                                <h3>Register no : {i.RegisterNo}</h3>
                            </div>
                        </div>
                    )
                }
            </div>


        </div>
    );
};

export default StudentClass;