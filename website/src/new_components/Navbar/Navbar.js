import BottomNavbar from "./BottomNavbar";
import MiddleNavbar from "./MiddleNavbar";
import TopNavbar from "./TopNavbar";

export default function Navbar({ datas, menus }) {
  return (
    <div>
      <TopNavbar serverHost={datas.serverHost} ></TopNavbar>
      <MiddleNavbar datas={datas}></MiddleNavbar>
      <BottomNavbar menus={menus}></BottomNavbar>
    </div>
  );
}
















// export default function Navbar() {
//   return (
//     <div>
//     </div>
//   );
// }
