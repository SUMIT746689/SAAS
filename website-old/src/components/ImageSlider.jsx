import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'


function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className}  text-2xl  `}
      style={{ ...style, display: "relative", left: "10px", zIndex: "50" }}
      onClick={onClick}
    />
  );
}

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "relative", right: "10px", zIndex: "50" }}
      onClick={onClick}
    />
  );
}

const ImageSlider = ({ carousel_image }) => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
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
  // const images = ["service1.png",]
  return (
    <>
      <Slider {...settings}>
        {
          carousel_image?.map(i=><img className=" max-h-96 object-fill w-screen" src={`${i?.path}`} />)
        }
        {/* <img src="slider-1.jpg" />
        <img src="slider-1.jpg" />
        <img src="slider-1.jpg" />
        <img src="slider-1.jpg" /> */}

      </Slider>
    </>
  )
};

export default ImageSlider;
