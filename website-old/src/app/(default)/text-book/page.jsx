"use client";
import Link from 'next/link';
import React from 'react';

const page = () => {
    return (
        <div>
            <div>
                <h2 className='text-3xl p-4'>পাঠ্যপুস্তক</h2>
                <p className=' text-center text-3xl text-green-600'>২০২৩ শিক্ষাবর্ষের সকল পাঠ্যপুস্তক</p>

                <div className=' m-32 grid grid-cols-1 gap-4  md:grid-cols-2 shadow-md place-content-center border-2 p-12 text-blue-500 underline'>
                    <Link target='_blank' href='http://nctb.portal.gov.bd/site/page/c6816afa-4e9f-4bde-8dd0-6d44074baf7f' className=' p-4  text-center'>প্রাক প্রাথমিক, ইবতেদায়ী <br />

                        ও <br />

                        প্রথমিক স্তর
                    </Link>
                    <Link target='_blank' href='http://nctb.portal.gov.bd/site/page/221b05b6-76d6-4e79-9749-49a21823b1d8' className=' p-4 text-center'>মাধ্যমিক, দাখিল স্তর <br />

                        ও <br />

                        উচ্চ মাধ্যমিক স্তর
                    </Link>

                </div>
            </div>

        </div>
    );
};

export default page;