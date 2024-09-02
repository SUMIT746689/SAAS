"use client"
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';
import { handleTextChangeLangWise } from '@/utils/handleLanguage';
import { useContext } from 'react';
import { LanguageContext } from '@/app/context/language';


function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className}`}
      style={{ ...style, display: "relative", left: "10px", zIndex: "50", backgroundColor: "gray", borderRadius: '100%' }}
      onClick={onClick}
    />
  );
}

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "relative", right: "10px", zIndex: "50", backgroundColor: "gray", borderRadius: '100%' }}
      onClick={onClick}
    />
  );
}

export const ImageSlider = ({ carouselImages }) => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
    appendDots: ({ dots }) => {
      // console.log({ dots })
      return <ul style={{ margin: '0px', backgroundColor: "white" }}>{dots}</ul>;
    },
    // customPaging: function (slider, i) {
    //   return '<button type="button" dataole="none" role="button" tabindex="0" style="width: 8px; height: 8px; border-radius: 50%; background: #9d9d9d; margin: 0px !important;" class="custom-dot"></button>';
    // }
    // responsive: [
    //   // {
    //   //   breakpoint: 1024,
    //   //   settings: {
    //   //     slidesToShow: 3,
    //   //     slidesToScroll: 3,
    //   //     infinite: true,
    //   //     dots: true
    //   //   }
    //   // },
    //   // {
    //   //   breakpoint: 600,
    //   //   settings: {
    //   //     slidesToShow: 2,
    //   //     slidesToScroll: 2,
    //   //     initialSlide: 2
    //   //   }
    //   // },
    //   {
    //     breakpoint: 480,
    //     settings: {
    //       slidesToShow: 1,
    //       slidesToScroll: 1
    //     }
    //   }
    // ]
  };

  return (
    <>
      <Slider {...settings}>
        {
          carouselImages?.map((i, index) =>
            <Image key={index} src={`${i?.path}`} alt="slider" width={822} height={420} className="rounded-lg object-contain w-[822px] h-[420px]" />
          )
        }
      </Slider>
    </>
  )
};

function SamplePrevRespArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className}`}
      style={{ ...style, display: "relative", left: "-30px", zIndex: "50", backgroundColor: "gray", borderRadius: '100%' }}
      onClick={onClick}
    />
  );
}

function SampleNextResArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "relative", right: "-30px", zIndex: "50", backgroundColor: "gray", borderRadius: '100%' }}
      onClick={onClick}
    />
  );
}

export const ResponsiveImageSlider = ({ gallaryImages }) => {

  const { language } = useContext(LanguageContext);

  const settings = {
    classNames: " bg-sky-500 flex gap-4",
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: gallaryImages.length > 2 ? 3 : gallaryImages.length,
    slidesToScroll: 1,
    initialSlide: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 5000,
    // centerPadding: '60px',
    // centerPadding:"100px",
    prevArrow: <SamplePrevRespArrow />,
    nextArrow: <SampleNextResArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  return (
    <div className='bg-[#FFF8E5] '>
      <div className=" mx-auto max-w-8xl pt-8 pb-10 px-20 ">
        <Slider {...settings}>
          {
            gallaryImages?.map((i, index) =>
              <div key={index} className=' px-4 bg-[#FFF8E5]'>
                <div className=' bg-white p-1 sm:p-2 shadow-md flex flex-col justify-center items-center xl:h-[300px]'>
                  {/* <div className='overflow-hidden'> */}
                  <Image width={500} height={300} className=' object-center object-contain sm:h-[120px] md:h-[220px] xl:h-[260px]' src={`${i?.url}`} alt='gallary image' />
                  {/* </div> */}
                  <h1 className=" text-sm sm:text-base pt:1 sm:pt-2"> {handleTextChangeLangWise(language, 'Content Name', 'ছবির নাম')}: {i[`${language}_content_name`] || ''}</h1>
                </div>
              </div>
            )
          }
        </Slider>
      </div>
    </div>
  );
}