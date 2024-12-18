import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { cn } from "../../../utils/utils";
import { isTokenExpired } from "../../../pages/auth/checkToken";
import Styles from "./css/header.module.css";
import FlyoutMenus from "./flyoutMenus";
import ModalProfile from "./modalProfile";
import IconLogin from "../../../assets/icons/user-heart-svgrepo-com.svg";
import DrawersForCart from "./drawersForCart";
import DrawersInfoForCart from "./drawersInfoCart";
import DrawersPaymentForCart from "./drawersPaymentCart";

import Menu from "../../../assets/iconMenu.svg";
import iconBrand from "../../../assets/GRAX.svg";
import iconPhone from "../../../assets/noun-display-big-notch-4064633.svg";
import CartTiny from "../../../assets/icons/cart-tity.svg?react";
import UserTiny from "../../../assets/icons/user-tiny.svg?react";
function Header() {
  const [fullname, setFullname] = useState(localStorage.getItem("fullname"));
  const [token] = useState(localStorage.getItem("token"));
  const [open, setOpen] = useState(false);
  const [openOrderInfo, setOpenOrderInfo] = useState(false);
  const [openOrderPayment, setOpenOrderPayment] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu hash là #info-cart-order, mở Drawer Thông Tin Đơn Hàng
    if (window.location.hash === "#info-cart-order") {
      setOpen(false);
      setOpenOrderInfo(true);
      setOpenOrderPayment(false);
    } else if (window.location.hash === "#info-cart-order#payment-cart-order") {
      setOpen(false);
      setOpenOrderInfo(false);
      setOpenOrderPayment(true);
    } else {
      setOpenOrderInfo(false);
      setOpenOrderPayment(false);
    }
  }, [window.location.hash]);

  const getUserData = async () => {
    try {
      const response = await axios.get("/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFullname(response.data.fullname);
    } catch (error) {
      localStorage.clear();
      setFullname(null);
      console.error("Session expired or error fetching user data", error);
    }
  };
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("fullname");
      localStorage.removeItem("token");
      setFullname(null);
    } else if (fullname === null) {
      getUserData();
    }
  }, [token, fullname]);

  const [hideMenu, setHideMenu] = useState(false);
  const [hideProfile, setHideProfile] = useState(false);

  const handleMenu = () => {
    setHideMenu((prev) => !prev);
  };

  const handleProfile = () => {
    setHideProfile((prev) => !prev);
  };

  /**
   * @description Đang chờ xử lý
   */
  // const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  // const navigate = useNavigate();

  // const handleCartClick = () => {
  //   if (!isLoggedIn) {
  //     navigate("/auth/login");
  //   } else {
  //     setOpen(true)
  //   }
  // };

  const handleProceedToOrderInfo = () => {
    // Cập nhật URL với hash mới mà không tải lại trang
    window.location.hash = "#info-cart-order";
  };

  const handleProceedToOrderPayment = () => {
    // history.replaceState(null,
    //   window.location.pathname + window.location.hash,
    //   window.location.pathname);
    window.location.hash = "#info-cart-order#payment-cart-order";
  };

  return (
    <div className="bg-white w-full flex fixed z-10 justify-center border-b-gray-100 border-2 shadow-md py-4">
      <div className="w-[1351.47px] flex flex-col sm:flex-row justify-between items-center">
        <div
          className={cn(
            "flex sm:items-center sm:space-x-5 space-x-[270px] justify-between",
            Styles.responsiveMobile,
            Styles.responsiveRange
          )}
        >
          {/* Menu Button */}
          <div className="relative">
            <button
              className="flex items-center"
              type="button"
              aria-expanded="false"
              onClick={handleMenu}
            >
              <img src={Menu} className="w-[20px] h-[20px]" alt="Menu Icon" />
              <span className="pl-2 text-sm text-black">Danh mục</span>
            </button>

            {hideMenu && <FlyoutMenus />}
          </div>
          {/* Phone Info */}
            <div className="hidden sm:flex items-center space-x-2">
          <img src={iconPhone} className="w-5 h-5" alt="Phone Icon" />
          <span className="text-sm text-black">+84 876 787 946</span>
        </div>
        </div>

        {/* Logo Section */}
        <Link to={"/"}>
          <div className="flex justify-center w-full items-center mt-4 md:mr-24 md:mt-0">
            <div className="">
              <img src={iconBrand} alt="Logo" className="w-[100px] md:w-auto" />
            </div>
          </div>
        </Link>

        <div className="text-black mt-6 sm:hidden block">
          Đăng kí thành viên để có nhiều ưu đãi
        </div>

        <div className="mt-4 md:mt-0 flex flex-row items-center">
          <div className="mr-4">
            <button
              className="flex items-center"
              onClick={() => {
                setOpen(true);
                setOpenOrderInfo(false);
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div className="p-1">
                  <CartTiny />
                </div>
                <div className="text-black">Giỏ hàng</div>
              </div>
            </button>
            <DrawersForCart
              open={open}
              setOpen={setOpen}
              onProceed={handleProceedToOrderInfo}
            />
            <DrawersInfoForCart
              open={openOrderInfo}
              setOpen={setOpenOrderInfo}
              onProceed={handleProceedToOrderPayment}
            />
            <DrawersPaymentForCart
              open={openOrderPayment}
              setOpen={setOpenOrderPayment}
            />
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
          {fullname ? (
            <button
              onClick={handleProfile}
              className="border border-gray-300 text-black hover:border-black rounded-full px-4 py-2 flex items-center text-sm sm:text-base"
            >
              <i className="fas fa-user mr-2"></i>Hi, {fullname}
            </button>
          ) : (
            <Link to="/auth/login">

              <button className="border border-gray-300 text-black hover:border-black rounded-full px-4 py-2 flex items-center text-sm sm:text-base">
                <img className="h-5 w-5 mr-2" src={IconLogin} alt="Login" /> Đăng nhập

            <button className="border border-gray-300 text-black hover:border-[#121212] rounded-full px-[100px] sm:px-4 py-2 flex items-center">

              </button>
              </button>
            </Link>
          )}
        </div>
  
        {/* <div className="">
            <button
              className=""
              onClick={() => {
                setOpen(true);
                setOpenOrderInfo(false)
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div className=" p-1">
                  <CartTiny />
                </div>
                <div className="text-black">Giỏ hàng</div>
              </div>
            </button>
            <DrawersForCart open={open} setOpen={setOpen} onProceed={handleProceedToOrderInfo}/>
            <DrawersInfoForCart open={openOrderInfo} setOpen={setOpenOrderInfo} onProceed={handleProceedToOrderPayment}/>
            <DrawersPaymentForCart open={openOrderPayment} setOpen={setOpenOrderPayment} />
          </div> */}
      </div>
    </div>
    </div>
  );
}

export default Header;
