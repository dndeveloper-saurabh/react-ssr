import React, {useState, useContext, useEffect, useRef, useMemo} from "react";
import Modal from "react-modal";
import Switch from "react-switch";
import firebase from "firebase/app";
import Timer from "react-compound-timer";
import Icon from "@material-ui/core/Icon";
import Fade from "@material-ui/core/Fade";
import StarRatings from "react-star-ratings";
import PhoneInput from "react-phone-input-2";
import Resizer from "react-image-file-resizer";
import { useMediaQuery } from "react-responsive";
import Snackbar from "@material-ui/core/Snackbar";
import CancelIcon from "@material-ui/icons/Cancel";
import SwipeableViews from "react-swipeable-views";
import WhatsApp from "@material-ui/icons/WhatsApp";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronRight, Info } from "@material-ui/icons";
import { Dialog, Menu, Drawer } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { db, firebaseApp } from "../../../../firebase_config";
import { Link, useLocation, useHistory } from "react-router-dom";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import {
  EmailShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
  TelegramIcon,
} from "react-share";
import Lottie from "lottie-react-web";
import {
  logOut,
  signInWithPhone,
  submitPhoneNumberAuthCode,
  updatePhoneNumber,
  removeFcmToken,
} from "../../../../services/auth";
import {
  updateProfileImage,
  updateUserName,
  updateAppRating,
  changeUserGrade,
  getReferredUserList,
  generateInvitationLink,
  refillPayment,
  isStudentEngaged,
} from "../../../../database";
import {
  ThemeContext,
  UserContext,
  PustackProContext,
  SubjectModalContext,
} from "../../../../context";

import {
  CheckIconGreen,
  CouponBottomImageDark,
  CouponBottomImageLight,
  CouponBottomShadowDark,
  CouponBottomShadowLight,
  CouponShadowDark,
  CouponShadowLight,
  EatPizza,
  FriendIcon,
  Thirty,
  ThirtyBack,
  ThirtyMid,
  Friends,
  OpenGift,
  ShareLink,
  logo as PustackLogo,
  logoDark as PustackLogoDark,
  goldSim,
  goldCard,
  defaultPic,
  PustackLogoGold,
  proMaskBg,
  settingsIcon,
  smartPhone,
  memberSince,
  astronaut,
  planet1,
  planet2,
  planet3,
  planet4,
  planet5,
  planet6,
  // studentCare,
  circularProgress,
  Pos,
  PosOriginal,
  PosReceipt,
  PosReceiptOriginal,
  BarCode,
  nounBook,
  referralImage, planet8
} from "../../../../assets";
import "react-phone-input-2/lib/style.css";
import PuStackCareMobile from "./../../pustack-care-mobile";
import info from "../../../../assets/pustackCareChat/info.svg";
import failureLottie from "../../../../assets/lottie/fail.json";
import confirmedLottie from "../../../../assets/lottie/confirm.json";
import UserAnalytics from "../../../../components/home/userAnalytics";
import PdfPreview from "./../../../../components/newsfeed/pdf-preview";

import {
  starPath,
  privacyPolicy,
  loadingWrapper,
  termsOfService,
} from "../../../../helpers";
import "./style.scss";
import {getAvailableGrades, getGradeNameByValue} from "../../../../database/home/fetcher";
import CloseIcon from "@material-ui/icons/Close";

const CheckGreenIcon = () => (
  <Icon>
    <img
      alt="check-green"
      src={CheckIconGreen}
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

const useForceUpdate = () => {
  const [, setValue] = useState(0);
  return () => setValue((value) => ++value); // update the state to force render
};

const formatJoiningDate = (timestamp) => {
  if (!timestamp) return;
  return format(new Date(timestamp), "PPP");
};

const formatJoiningDate2 = (timestamp) => {
  if (!timestamp) return;
  return formatDistanceToNow(new Date(timestamp));
};

const AccountSettings = ({ setBackdrop, profileVisibility }) => {
  const forceUpdate = useForceUpdate();

  const [isUserPro] = useContext(UserContext).tier;
  const [isInstructor] = useContext(UserContext).isInstructor;
  const [user, setUser] = useContext(UserContext).user;
  const [openMenu, setOpenMenu] = useContext(UserContext).openMenu;
  const [totalSeconds] = useContext(UserContext).totalSeconds;
  const [openMenuSettings, setOpenMenuSettings] =
    useContext(UserContext).openMenuSettings;
  const [openChat, setOpenChat] = useContext(UserContext).openChat;
  const [, setOpenPustackCare] = useContext(UserContext).openPustackCare;
  const [closeCarePage, setCloseCarePage] =
    useContext(UserContext).closeCarePage;
  const [isSubjectModalOpen] = useContext(SubjectModalContext).isOpen;

  const [isDark, setIsDark] = useContext(ThemeContext).theme;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;

  const [plural, setPlural] = useState(true);
  const [message, setMessage] = useState("");
  const [refillMessage, setRefillMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [spaceKey, setSpaceKey] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [allowNext, setAllowNext] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [resendCode, setResendCode] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [hadClass2, setHadClass2] = useState(false);
  const [referredList, setReferredList] = useState([]);
  const [referralLink, setReferralLink] = useState("");
  const [openSharableModal, setOpenSharableModal] = useState(false);
  const [openGradeChangeModal, setOpenGradeChangeModal] = useState(false);
  const [changingGrade, setChangingGrade] = useState(false);
  const [activeGradeItemInModal, setActiveGradeItemInModal] = useState(null);
  const [documentToShow, setDocumentToShow] = useState("");
  const [otpCode, setOtpCode] = useState(Array(6).fill(""));
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [openLearnMore, setOpenLearnMore] = useState([false, false]);
  const [friendDetails, setFriendDetails] = useState(null);
  const [openFriendsDrawer, setOpenFriendsDrawer] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const [clickedBtn, setClickedBtn] = useState(null);
  const [refillAmount, setRefillAmount] = useState("");
  const [openRefillPage, setOpenRefillPage] = useState(false);
  const [processingRefill, setProcessingRefill] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(false);
  const [orderSuccessfull, setOrderSuccessfull] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone_country_code + user?.phone_number
  );
  const [hidePoweredBy, setHidePoweredBy] = useState(false);
  const [profileName, setProfileName] = useState(user?.name);
  const [openFriendsList, setOpenFriendsList] = useState(false);
  const [countryCode, setCountryCode] = useState(user?.phone_country_code);
  const [activeIndex, setActiveIndex] = useState(openMenuSettings ? 1 : 0);
  const [profileImage, setProfileImage] = useState({ url: user?.profile_url });
  const [rating, setRating] = useState(user?.app_rating ? user?.app_rating : 0);

  const history = useHistory();
  const location = useLocation();
  let recaptchaRef = useRef(null);
  let refillInput = useRef();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const milliSeconds = user?.pro_expiration_date?.seconds * 1000;
  let expiryDate = null;
  if (milliSeconds) {
    expiryDate = format(new Date(milliSeconds), "MM/dd/yyyy");
  }

  useEffect(() => {
    setPhoneNumber(user?.phone_country_code + user?.phone_number);
    setActiveIndex(openMenuSettings ? 1 : 0);
    setRating(user?.app_rating ? user?.app_rating : 0);
    setProfileName(user?.name);
    setProfileImage({ url: user?.profile_url });
  }, [
    user?.profile_url,
    user?.phone_country_code,
    user?.phone_number,
    user?.app_rating,
  ]);

  const handleSnackClose = () => {
    setOpenSnack(false);
  };

  const isStudentBusy = async () => {
    if (!user?.uid) return true;

    const isBusy = await isStudentEngaged({
      studentId: user?.uid,
    });

    return isBusy;
  };

  const changeRating = async (newRating) => {
    const _rating = rating;
    setRating(newRating);

    if (newRating !== _rating) {
      const isUpdated = await updateAppRating(user?.uid, newRating);

      if (isUpdated) {
        const updatedUser = {
          ...user,
          app_rating: newRating,
          has_rated_app: true,
        };
        setUser(updatedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: updatedUser?.uid,
            grade: updatedUser?.grade,
            name: updatedUser?.name,
            profile_url: updatedUser?.profile_url,
          })
        );

        setHasRated(true);
        setTimeout(() => setHasRated(false), 2500);
      } else {
        setRating(_rating);
      }
    }
  };

  const onLogOutBtnClick = async () => {
    let fcmToken = localStorage.getItem("fcmToken");
    let isTokenRemoved = await removeFcmToken(user?.uid, fcmToken);

    if (isTokenRemoved) {
      let logout_success = await logOut();
      if (logout_success) {
        setUser(null);

        loadingWrapper();

        localStorage.clear();
        localStorage.setItem("hideCookie", true);

        window.location = "/";
      }
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setBackdrop(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setBackdrop(false);
    setTimeout(() => setActiveIndex(0), 500);
    setProfileName(user?.name);
    setPhoneNumber(user?.phone_country_code + user?.phone_number);
    setCountryCode(user?.phone_country_code);
    setOtpSent(false);
    setOtpError(false);
    setOtpCode(Array(6).fill(""));
    setSendingOtp(false);
    setPhoneNumberError("");
    setOpenMenuSettings(false);
    setOpenFriendsList(false);
    setOpenRefillPage(false);
    setOrderStatus(false);
    setOrderId(null);
    setProcessingRefill(false);
    setProcessingOrder(false);
    setRefillAmount("");
    setOrderSuccessfull(false);
  };

  const handleDrawerClose = () => {
    history.push(currentPath);
    setIsOpen(false);
    setProfileName(user?.name);
    setPhoneNumber(user?.phone_country_code + user?.phone_number);
    setCountryCode(user?.phone_country_code);
    setOtpError(false);
    setOtpCode(Array(6).fill(""));
    setOtpSent(false);
    setSendingOtp(false);
    setPhoneNumberError("");
    setOpenMenuSettings(false);
    setOpenFriendsList(false);
    setOrderStatus(false);
    setOpenRefillPage(false);
    setOrderStatus(false);
    setOrderId(null);
    setProcessingRefill(false);
    setProcessingOrder(false);
    setRefillAmount("");
    setOrderSuccessfull(false);
  };

  const grades = useMemo(() => {
    const gradesList = getAvailableGrades(false, true).map(c => ({name: c.grade, value: c.value, planet: c.planet}));
    // const gradesList = [
    //   {
    //     name: "Class 9",
    //     value: "class_9",
    //   },
    //   {
    //     name: "Class 10",
    //     value: "class_10",
    //   },
    // ];

    if(user?.grade === 'class_2' || hadClass2) {
      setHadClass2(true);
      gradesList.splice(0, 0, {
        name: "Class 2",
        value: "class_2",
        planet: planet8
      })
    }
    return gradesList;

  }, [user, hadClass2]);

  useEffect(() => {
    if (openMenu) {
      let currentTarget = document.getElementById("userMenuAnchor");
      handleClick({ currentTarget });
      setOpenMenu(false);
    }
  }, [openMenu]);

  useEffect(() => {
    setProfileImage({ url: user?.profile_url });
  }, [user?.profile_url]);

  const handleGradeChange = async (grade) => {
    // let grade = e.target.value;
    if(changingGrade) return;
    setChangingGrade(grade);
    let prevGrade = user?.grade;

    const updatedUser = { ...user, grade };
    setUser(updatedUser);

    // if (
    //   currentPath.split("/")[1] === "doubts" &&
    //   (currentPath.split("/")[2] || "") &&
    //   !openMenuSettings
    // ) {
    //   history.push("/doubts");
    // }

    let res = await changeUserGrade(user?.uid, grade);
    if (!res) {
      const updatedUser = { ...user, grade: prevGrade };
      setUser(updatedUser);
    }
    setChangingGrade(false);
    setOpenGradeChangeModal(false);
    setActiveIndex(1);
  };

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const updateUserFullName = async () => {
    const isUpdated = await updateUserName(user?.uid, profileName.trim());

    if (isUpdated) {
      const updatedUser = { ...user, name: profileName.trim() };

      setUser(updatedUser);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: updatedUser?.uid,
          grade: updatedUser?.grade,
          name: updatedUser?.name,
          profile_url: updatedUser?.profile_url,
        })
      );

      setMessage("Your name has been updated");
      setOpenSnack(true);
      setTimeout(() => setOpenSnack(false), 2500);
    } else {
      setProfileName(user?.name);
    }
  };

  const resizeProfilePic = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        400,
        400,
        "JPEG",
        70,
        0,
        (uri) => resolve(uri),
        "file"
      );
    });

  const profileImageSelectionHandler = async (e) => {
    const { files } = e.target;

    const profilePic = await resizeProfilePic(files[0]);

    let _image = {
      url: URL.createObjectURL(profilePic),
      ext: files[0].name.split(".").slice(-1)[0],
    };

    setProfileImage(_image);
    const [url, isUpdated] = await updateProfileImage(_image, user?.uid);

    if (isUpdated && url) {
      const updatedUser = { ...user, profile_url: url };

      setUser(updatedUser);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: updatedUser?.uid,
          grade: updatedUser?.grade,
          name: updatedUser?.name,
          profile_url: updatedUser?.profile_url,
        })
      );

      setMessage("Your image has been updated");
      setOpenSnack(true);
      setTimeout(() => setOpenSnack(false), 2500);
    } else {
      setProfileImage({ url: user?.profile_url });
    }
  };

  const openProSlider = () => {
    setIsSliderOpen(true);
  };

  const handleSendingOTP = () => {
    if (phoneNumber.length > 8) {
      setTimeout(() => {
        setOtpSent(true);
        setSendingOtp(true);
      }, 2000);

      signInWithPhone(
        "+" + phoneNumber,
        countryCode,
        setActiveIndex,
        2,
        setSendingOtp,
        setPhoneNumberError,
        null,
        null,
        null,
        null
      );
    } else {
      setPhoneNumberError("Invalid phone number");
      setTimeout(() => setPhoneNumberError(""), 5000);
    }
  };

  const handlePhoneNumberChange = async () => {
    const _userData = {
      ...user,
      phone_number: phoneNumber.slice(countryCode.length),
      phone_country_code: countryCode,
    };

    const updated = await updatePhoneNumber(
      user?.uid,
      phoneNumber.slice(countryCode.length),
      countryCode
    );

    if (updated) {
      setUser(_userData);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: _userData?.uid,
          grade: _userData?.grade,
          name: _userData?.name,
          profile_url: _userData?.profile_url,
        })
      );

      setActiveIndex(1);
      setOtpError(false);
      setPhoneNumber(_userData?.phone_country_code + _userData?.phone_number);
      setCountryCode(_userData?.phone_country_code);
      setOtpError(false);
      setOtpCode(Array(6).fill(""));
      setOtpSent(false);
      setSendingOtp(false);
      setPhoneNumberError("");
    }
  };

  const handleOTPChange = async (e, i) => {
    const { maxLength, value } = e.target;
    forceUpdate();

    if (spaceKey) return;

    otpCode[i] = value;
    setOtpCode(otpCode);

    const code = otpCode?.join("");

    if (code.length === 6) {
      const [_, res, errorMessage] = await submitPhoneNumberAuthCode(code, null, null, true);

      if (res) {
        setOtpError(false);
        setAllowNext(true);
      } else {
        setOtpError(errorMessage);
        setAllowNext(false);
        navigator && navigator.vibrate && navigator.vibrate([10, 10]);
      }
    } else {
      setOtpError(false);
      setAllowNext(false);
    }

    if (value.length >= maxLength && i < 5) {
      const nextField = document.querySelector(
        `div > input[name=input${i + 1}]`
      );
      if (nextField !== null) nextField.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === " ") {
      setSpaceKey(true);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      forceUpdate();

      if (otpCode[i]?.length === 0 && i > 0 && i <= 5) {
        const prevField = document.querySelector(
          `div > input[name=input${i - 1}]`
        );
        if (prevField !== null) prevField.focus();
      }
    } else {
      setSpaceKey(false);
    }
  };

  const handleAccountSettingsOpen = () => {
    setIsOpen(true);
    setActiveIndex(0);

    history.push(
      `${
        currentPath === "/" ? "" : "/" + currentPath.replace(/\//g, "")
      }/?page=account`
    );
  };

  useEffect(() => {
    if (openMenuSettings) setActiveIndex(1);
  }, [openMenuSettings]);

  useEffect(() => {
    if (activeIndex === 2) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        `recaptcha-container`,
        {
          size: "invisible",
          callback: (response) => console.log({ response }),
          "expired-callback": () => window.recaptchaVerifier.clear(),
        },
        firebaseApp
      );
    }
  }, [activeIndex]);

  useEffect(() => {
    if (isOpen && isSmallScreen) {
      history.listen((_, action) => {
        if (action === "POP") {
          if (activeIndex === 2) {
            setActiveIndex(1);
            history.push("/?page=settings");
          } else if (activeIndex === 1) {
            setActiveIndex(0);
            history.push("/?page=account");
          } else if (activeIndex === 0) {
            handleDrawerClose();
            history.push("/");
          }
        }
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    user?.uid && getReferredUserListFn();
  }, [user?.uid]);

  const getReferredUserListFn = async () => {
    const res = await getReferredUserList(user?.uid);
    setReferredList(res?.sort((a, b) => b.sign_up_ts - a.sign_up_ts));
  };

  const handleLearnMoreClose = () => {
    setOpenLearnMore([false, false]);
  };

  const generateInviteLinkAndShare = async () => {
    if (user?.uid && !generatingLink) {
      setGeneratingLink(true);
      const res = await generateInvitationLink(user?.uid);
      setReferralLink(res?.shortLink);

      handleLearnMoreClose();
      setGeneratingLink(false);

      if (navigator?.canShare && res?.shortLink) {
        return await navigator.share({
          title: "PuStack Referral Program",
          text: "Invite your friends to sign up through your referral link",
          url: res?.shortLink,
        });
      } else if (res?.shortLink) {
        setOpenSharableModal(true);
      }
    }
  };

  const copyToClipBoard = () => {
    navigator.clipboard.writeText(referralLink);
  };

  const ReferralProgramInfo = () => (
    <div className="referral-program">
      <h1>PuStack Referral Program</h1>
      <CancelIcon
        className="close-referral-modal"
        onClick={handleLearnMoreClose}
      />
      <div className="referral-program-div">
        <div className="referral-program-list">
          <img src={ShareLink} alt="generate" draggable={false} />
          <div>
            <h4>1. Generate link</h4>
            <h6>Generate your unique referral link</h6>
          </div>
        </div>
        <div className="referral-program-list">
          <img src={Friends} alt="invite" draggable={false} />
          <div>
            <h4>2. Invite friends</h4>
            <h6>Invite your friends to sign up through your referral link</h6>
          </div>
        </div>
        <div className="referral-program-list">
          <img src={OpenGift} alt="rewards" draggable={false} />
          <div>
            <h4>3. Get rewards</h4>
            <h6>
              Both you and your friend will get free Pro membership for 30 days
              once your friend signs up
            </h6>
          </div>
        </div>
        <button className="share-btn" onClick={generateInviteLinkAndShare}>
          Share
        </button>
      </div>
    </div>
  );

  const ReferredFriendInfo = () => (
    <div className="referral-program">
      <h1>Referral Reward Granted</h1>
      <CancelIcon
        className="close-referral-modal"
        onClick={() => setFriendDetails(null)}
      />
      <div className="referral-program-div">
        <div className="referral-program-list granted">
          <img src={info} alt="generate" draggable={false} />
          <div>
            <h4>What happened?</h4>
            <h6>
              Your friend {friendDetails?.name} joined PuStack using your
              referral link on {formatJoiningDate(friendDetails?.sign_up_ts)}.
              For this kind gesture, we have rewarded you both PuStack Pro
              membership for 30 more days!
            </h6>
          </div>
        </div>
        <div className="referral-program-list granted">
          <img src={info} alt="invite" draggable={false} />
          <div>
            <h4>Can I earn more?</h4>
            <h6>
              Of course! There is no limit to rewards you can earn! Invite 1
              friend, get a free month. Invite 10, get 10 months! As simple as
              1, 2, 3...
            </h6>
          </div>
        </div>

        <button className="share-btn" onClick={generateInviteLinkAndShare}>
          Invite More Friends!
        </button>
      </div>
    </div>
  );

  const ReferredFriendsList = () => (
    <div className="referral-program all-list">
      <h1>Referrals</h1>
      <CancelIcon
        className="close-referral-modal"
        onClick={() => setOpenFriendsDrawer(false)}
      />
      <div className="referral-program-div">
        <div className="referral-graph">
          <div className="main-user">
            <div className="user-ring"></div>
            <img src={user?.profile_url} alt={user?.name} draggable={false} />
          </div>
          {referredList?.slice(0, 5)?.map((item, i) => (
            <img
              src={item.profile_url}
              className={`referred-${i}`}
              alt={item?.name}
              draggable={false}
            />
          ))}
          {[planet1, planet2, planet3, planet4, planet5, planet6].map(
            (planet, i) => (
              planet
              // <img
              //   src={planet}
              //   className={`planet-${i}`}
              //   alt="planet"
              //   draggable={false}
              // />
            )
          )}
        </div>
        <div className="referred-list">
          <h6>Recent</h6>
          <div className="referred-friends">
            {referredList?.map((item) => (
              <div key={item?.name} className="referred-details-wrapper">
                <img
                  src={item.profile_url}
                  alt={item?.name}
                  draggable={false}
                />
                <div className="referred-details">
                  <h5>{item?.name}</h5>
                  <p>Joined {formatJoiningDate2(item?.sign_up_ts)} ago.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const UserCard = () => (
    <div className="user-card">
      <img
        className="user-card-background"
        src={goldCard}
        alt="user-card-bg"
        draggable={false}
      />

      <img
        src={PustackLogoGold}
        alt="gold"
        className="pustack-gold"
        draggable={false}
      />
      <img
        className="user-card-sim"
        src={goldSim}
        alt="user-card-sim"
        draggable={false}
      />
      <div className="user-card-details">
        <div className="user-tier-wrapper">
          <div className="user-tier">
            <h5 className="user-tier-tag">{isUserPro ? "PRO" : "Basic"}</h5>
            {isUserPro && (
              <>
                <h4>
                  <span>VALID</span>
                  <span>THRU</span>
                </h4>
                <h6>{expiryDate && expiryDate}</h6>
              </>
            )}
          </div>
          <div className="user-details">
            <h6>{user?.name}</h6>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const orderStatusListener = () => {
      const doc = db.collection("orders").doc(orderId);
      setProcessingOrder(true);

      return doc.onSnapshot((docSnapshot) => {
        const { transaction_status } = docSnapshot.data();

        if (
          transaction_status === "authorization_failed" ||
          transaction_status === "payment_capture_failed"
        ) {
          setOrderSuccessfull(false);
          setTimeout(() => setOrderStatus(true), 1000);
          setProcessingRefill(false);
        }
        if (transaction_status === "payment_captured") {
          setOrderSuccessfull(true);
          setTimeout(() => setOrderStatus(true), 1000);
          setProcessingRefill(false);
        }
      });
    };

    if(orderId) {
      const unsubscribe = orderStatusListener();
      return () => unsubscribe();
    }
  }, [orderId])

  const posKeyPress = (num) => {
    const _amount = refillAmount + String(num);
    setClickedBtn(num);
    setTimeout(() => setClickedBtn(null), 250);
    if (Number(_amount) < 100000) {
      setRefillAmount(_amount);
      setRefillMessage(null);
    } else {
      setRefillMessage("Maximum Refill Amount: ₹99,999");
      setTimeout(() => setRefillMessage(null), 3000);
    }
    if (isSmallScreen) return navigator && navigator.vibrate && navigator.vibrate(5);
    else refillInput.current.focus();
  };

  const posInputChange = (e) => {
    if (e.target.value < 100000) {
      setRefillMessage(null);
      setRefillAmount(e.target.value);
    } else {
      setRefillMessage("Maximum Refill Amount: ₹99,999");
      setTimeout(() => setRefillMessage(null), 3000);
    }

    if (isSmallScreen) navigator && navigator.vibrate && navigator.vibrate(5);
  };

  const handleProfileNameChange = (e) => {
    let value = e.target.value;
    // if(value.trim().length > 40) return;
    setProfileName(value);
  }

  const confirmRefill = async () => {
    const isBusy = await isStudentBusy();

    if (isBusy) {
      setRefillMessage("You are engaged in a blaze Session");
      return setTimeout(() => setRefillMessage(""), 3000);
    }

    if (
      Number(refillAmount) > 25 &&
      Number(refillAmount) < 100000 &&
      !processingRefill
    ) {
      if (isSmallScreen) navigator && navigator.vibrate && navigator.vibrate(5);
      setClickedBtn("Enter");
      setTimeout(() => setClickedBtn(null), 250);
      refillPayment({
        refillAmount,
        user,
        setOrderId,
        setProcessingOrder,
        setProcessingRefill,
      });
      setProcessingRefill(true);
    } else {
      setRefillMessage(
        "Maximum Refill Amount: ₹99,999, Minimum Refill Amount: ₹25"
      );
      setTimeout(() => setRefillMessage(""), 3000);
    }
  };

  return (
    <>
      <div>
        {user ? (
          <div className="account-settings">
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              open={openSnack}
              onClose={handleSnackClose}
              message={message}
              key={"bottom" + "center"}
              TransitionComponent={Fade}
              className={isDark ? "snackbar snackbarDark" : "snackbar"}
            />
            {profileVisibility && (
              <div
                className="user__menu__btn"
                id="userMenuAnchor"
                onClick={(e) =>
                  isSmallScreen ? handleAccountSettingsOpen() : handleClick(e)
                }
                referrerPolicy="no-referrer"
              >
                <img
                  className="navigation-profile-img"
                  src={user?.profile_url ? user?.profile_url : defaultPic}
                  alt="dp"
                  draggable={false}
                />
                <div className="user__name">{user?.name?.split(" ")[0]}</div>
              </div>
            )}
            <Menu
              id={isDark ? "dark-menu" : "light-menu"}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={!processingRefill && handleClose}
              style={{ top: "0px" }}
              className={
                activeIndex === 0 || openFriendsDrawer
                  ? openFriendsList
                    ? "menu-primary list-opened"
                    : "menu-primary"
                  : openRefillPage
                  ? "menu-refill"
                  : activeIndex === 3 ? "menu-grade" : "menu-secondary"
              }
            >
              {!isOpen && !isSmallScreen && (
                <SwipeableViews
                  axis={"x"}
                  scrolling={"false"}
                  index={activeIndex}
                  style={{ outline: "none", width: "320px" }}
                  ignoreNativeScroll={true}
                  disabled={true}
                >
                  <div
                    className={
                      activeIndex === 0
                        ? "profile-page"
                        : "profile-page settings-page"
                    }
                  >
                    <div className="page-title-wrapper">
                      <h2 className="page-title">Account</h2>
                      <img
                        onClick={() => setActiveIndex(1)}
                        src={settingsIcon}
                        alt="SI"
                        draggable={false}
                      />
                    </div>
                    <div className="page-content">
                      <div className="user-card">
                        <img
                          className="user-card-background"
                          src={goldCard}
                          alt="user-card-bg"
                          draggable={false}
                        />
                        <img
                          className="user-profile-picture"
                          src={user?.profile_url ? user?.profile_url : defaultPic}
                          onClick={() => setActiveIndex(1)}
                          alt="userdp"
                          draggable={false}
                        />
                        <img
                          src={PustackLogoGold}
                          alt="gold"
                          className="pustack-gold"
                          draggable={false}
                        />
                        <img
                          className={
                            !user?.is_external_instructor
                              ? "user-card-sim"
                              : "user-card-sim external"
                          }
                          src={goldSim}
                          alt="user-card-sim"
                          draggable={false}
                        />

                        {!user?.is_external_instructor && (
                          <div
                            className="wallet-balance"
                            // onClick={async () => {
                            //   const isBusy = await isStudentBusy();
                            //   if (!isBusy) {
                            //     setOpenRefillPage(true);
                            //     setActiveIndex(1);
                            //   } else {
                            //     setMessage("You are busy in a blaze session");
                            //     setOpenSnack(true);
                            //     setTimeout(() => setOpenSnack(false), 2500);
                            //   }
                            // }}
                            onClick={() => {
                              setMessage("Wallet access coming soon");
                              setOpenSnack(true);
                              setTimeout(() => setOpenSnack(false), 5000);
                            }}
                          >
                            <h2>Wallet Balance</h2>
                            <h6>
                              ₹{" "}
                              {user?.balance
                                ? user?.balance?.toLocaleString("en-IN")
                                : 0}
                            </h6>
                          </div>
                        )}
                        <div className="user-card-details">
                          <div className="user-tier-wrapper">
                            <div className="user-tier">
                              <h5 className="user-tier-tag">
                                {isUserPro ? "PRO" : "Basic"}
                              </h5>
                              {isUserPro && (
                                <>
                                  <h4>
                                    <span>VALID</span>
                                    <span>THRU</span>
                                  </h4>
                                  <h6>{expiryDate && expiryDate}</h6>
                                </>
                              )}
                            </div>
                            <div className="user-details">
                              <h6>{user?.name}</h6>
                            </div>
                          </div>
                          <div className={"user-validity"}>
                            <img
                              src={memberSince}
                              alt="member-since"
                              draggable={false}
                            />
                            <h6>{new Date(user?.sign_up_ts).getFullYear()}</h6>
                          </div>
                        </div>
                      </div>

                      <div className="user-experience">
                        <div
                          className={
                            isDark ? "user-star-rate dark" : "user-star-rate"
                          }
                        >
                          {!hasRated ? (
                            <>
                              <h6>Rate Experience</h6>
                              <StarRatings
                                name="rating"
                                rating={rating}
                                numberOfStars={5}
                                starSpacing="2px"
                                starDimension="20px"
                                svgIconPath={starPath}
                                starHoverColor="#fec107"
                                starRatedColor="#fec107"
                                changeRating={changeRating}
                                svgIconViewBox="0 0 207.802 207.748"
                              />
                            </>
                          ) : (
                            <div className="fadeIn">
                              <h5>Thank you for rating us</h5>
                              <span role="img" aria-label="smiley">
                                😊
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className={
                            isDark
                              ? "user-student-care dark"
                              : "user-student-care"
                          }
                          // onClick={() => {
                          //   handleClose();
                          //   setOpenPustackCare(true);
                          // }}
                        >
                          <a
                            // to={`${
                            //   currentPath === "/"
                            //     ? ""
                            //     : "/" + currentPath.replace(/\//g, "")
                            // }/?page=care`}
                            href="https://api.whatsapp.com/send?phone=16504794112"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsApp />
                          </a>
                        </div>
                      </div>

                      <div className="user-related-section">
                        <div
                          className={
                            isDark ? "user-pro-section dark" : "user-pro-section"
                          }
                        >
                          <h6>PuStack Pro</h6>
                          <img
                            className="user-pro-mask-bg"
                            src={proMaskBg}
                            alt="pro-mask-bg"
                            draggable={false}
                          />

                          <div
                            className="user-pro-wrapper"
                            onClick={() => setIsSliderOpen(true)}
                          >
                            <img
                              className="user-pro-image astronaut"
                              src={astronaut}
                              alt="pro-img"
                              draggable={false}
                              style={{
                                animationPlayState: isSubjectModalOpen
                                  ? "paused"
                                  : "running",
                              }}
                            />
                            <img
                              className="user-pro-image planet1"
                              src={planet1}
                              alt="pro-img"
                              draggable={false}
                              style={{
                                animationPlayState: isSubjectModalOpen
                                  ? "paused"
                                  : "running",
                              }}
                            />
                            <img
                              className="user-pro-image planet2"
                              src={planet2}
                              alt="pro-img"
                              draggable={false}
                              style={{
                                animationPlayState: isSubjectModalOpen
                                  ? "paused"
                                  : "running",
                              }}
                            />
                            <img
                              className="user-pro-image planet3"
                              src={planet3}
                              alt="pro-img"
                              draggable={false}
                              style={{
                                animationPlayState: isSubjectModalOpen
                                  ? "paused"
                                  : "running",
                              }}
                            />
                          </div>

                          <div className="view-benefits-wrapper">
                            <button
                              className={
                                isDark ? "view-benefits dark" : "view-benefits"
                              }
                              onClick={openProSlider}
                            >
                              {isUserPro ? "View Benefits" : "Join Pro"}
                            </button>
                          </div>
                        </div>
                        <div
                          className={
                            isDark ? "theme-toggle dark" : "theme-toggle"
                          }
                        >
                          <h6>Theme</h6>
                          <h5>Light</h5>
                          <h4>Dark</h4>
                          <div className={isDark ? "switch dark" : "switch"}>
                            <Switch
                              onChange={() => setIsDark(!isDark)}
                              checked={isDark}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              onColor={"#161616"}
                              offColor={"#fff"}
                              width={70}
                              checkedHandleIcon={
                                <div className="switch-knob"></div>
                              }
                              uncheckedHandleIcon={
                                <div className="switch-knob"></div>
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {isInstructor && <div className="manage-content" onClick={() => history.push('/cms')}>
                      Manage Content
                    </div>}
                    <div
                      className={
                        isDark ? "dropdown__footer dark" : "dropdown__footer"
                      }
                    >
                      <p>
                        <p
                          onClick={() => {
                            setDocumentToShow(termsOfService);
                            setShowPDF(true);
                          }}
                        >
                          Terms of Service
                        </p>{" "}
                        <span>•</span>{" "}
                        <p
                          onClick={() => {
                            setDocumentToShow(privacyPolicy);
                            setShowPDF(true);
                          }}
                        >
                          Privacy Policy
                        </p>
                      </p>
                    </div>
                  </div>

                  {openRefillPage ? (
                    <div className="profile-page">
                      <div
                        className={
                          isDark
                            ? "page-title-wrapper dark"
                            : "page-title-wrapper"
                        }
                      >
                        <h2 className="page-title">
                          <ArrowBackIcon
                            onClick={() => {
                              setActiveIndex(0);
                              setTimeout(() => setOpenRefillPage(false), 350);
                              setOrderStatus(false);
                              setOrderId(null);
                              setProcessingRefill(false);
                              setProcessingOrder(false);
                              setRefillAmount("");
                              setOrderSuccessfull(false);
                            }}
                          />
                          Add Wallet Balance
                        </h2>
                      </div>
                      <div className="pos-div">
                        <div className="pos-message">
                          {refillMessage && (
                            <div>
                              <p>
                                <Info /> {refillMessage}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="pos-wrapper">
                          <div
                            className={
                              orderStatus ? "pos-receipt" : "pos-receipt-hidden"
                            }
                          >
                            <img
                              src={PosReceiptOriginal}
                              alt="receipt"
                              draggable={false}
                            />
                          </div>

                          {orderStatus && (
                            <div className="pos-full-receipt">
                              <img
                                src={PosReceipt}
                                alt="receipt"
                                draggable={false}
                              />
                              <div className="pos-receipt-details">
                                <div className="receipt-head">
                                  <img src={nounBook} alt="logo" />
                                  <h1>PuStack Wallet</h1>
                                </div>

                                <div className="receipt-details">
                                  <div className="receipt-line">
                                    <h2>PuStack Category</h2>
                                    <h4>PuStack Credit</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Date</h2>
                                    <h4>{format(new Date(), "MMM do")}</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Amount</h2>
                                    <h4>₹ {refillAmount}</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Status</h2>
                                    <h4>{orderStatus ? "Success" : "Failure"}</h4>
                                  </div>
                                </div>
                                <div className="receipt-total">
                                  <h1>TOTAL</h1> <h4>₹ {refillAmount}</h4>
                                </div>
                                <div className="receipt-bar">
                                  <img
                                    src={BarCode}
                                    alt="barcode"
                                    draggable={false}
                                  />
                                  <h4>order_{orderId}</h4>
                                  <p>Thank you for your purchase</p>
                                </div>
                              </div>

                              <div className="order-completed-btns">
                                <button
                                  className="refill-more"
                                  onClick={() => {
                                    setOrderStatus(false);
                                    setOrderId(null);
                                    setProcessingRefill(false);
                                    setProcessingOrder(false);
                                    setRefillAmount("");
                                    setOrderSuccessfull(false);
                                  }}
                                >
                                  Add More
                                </button>
                                <button
                                  className="show-balance"
                                  onClick={() => {
                                    setActiveIndex(0);
                                    setTimeout(
                                      () => setOpenRefillPage(false),
                                      350
                                    );
                                    setOrderStatus(false);
                                    setOrderId(null);
                                    setProcessingRefill(false);
                                    setProcessingOrder(false);
                                    setRefillAmount("");
                                    setOrderSuccessfull(false);
                                  }}
                                >
                                  Show Balance
                                </button>
                              </div>
                            </div>
                          )}
                          <div className={orderStatus ? "hide-pos" : ""}>
                            <img
                              className="pos-original"
                              src={PosOriginal}
                              alt="posoriginal"
                              draggable={false}
                            />
                            <img
                              className="pos-top"
                              src={Pos}
                              alt="pos"
                              draggable={false}
                            />
                            <div className="pos-card">
                              <UserCard />
                            </div>
                            <div className="pos-screen">
                              {processingOrder ? (
                                processingRefill ? (
                                  <>
                                    <h5>Processing Order...</h5>
                                    <div className="pos-refilling">
                                      <Lottie
                                        options={{
                                          animationData: circularProgress,
                                          loop: true,
                                        }}
                                      />
                                    </div>
                                  </>
                                ) : orderSuccessfull ? (
                                  <div className="pos-status">
                                    <Lottie
                                      options={{
                                        animationData: confirmedLottie,
                                        loop: false,
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="pos-status">
                                    <Lottie
                                      options={{
                                        animationData: failureLottie,
                                        loop: false,
                                      }}
                                    />
                                  </div>
                                )
                              ) : processingRefill ? (
                                <>
                                  <h5>Processing Refill...</h5>
                                  <div className="pos-refilling">
                                    <Lottie
                                      options={{
                                        animationData: circularProgress,
                                        loop: true,
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h5>Enter Refill Amount: </h5>
                                  <h3>
                                    ₹
                                    <input
                                      type="number"
                                      autoFocus
                                      min={24}
                                      max={99999}
                                      value={
                                        Number(refillAmount) > 0
                                          ? Number(refillAmount)
                                          : ""
                                      }
                                      ref={refillInput}
                                      onChange={(e) => posInputChange(e)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Backspace")
                                          setClickedBtn(e.key);
                                        else setClickedBtn(Number(e.key));
                                        setTimeout(
                                          () => setClickedBtn(null),
                                          250
                                        );
                                      }}
                                    />
                                  </h3>
                                </>
                              )}
                            </div>
                            <div className="num-pad">
                              {numbers.map((num) => (
                                <div
                                  className={
                                    clickedBtn === num
                                      ? "num-btn num-pressed"
                                      : "num-btn"
                                  }
                                  key={num}
                                  onClick={() => posKeyPress(num)}
                                >
                                  <button>{num}</button>
                                </div>
                              ))}
                              <div className="num-btn">
                                <button></button>
                              </div>
                              <div
                                className={
                                  clickedBtn === 0
                                    ? "num-btn num-pressed"
                                    : "num-btn"
                                }
                              >
                                <button onClick={() => posKeyPress(0)}>0</button>
                              </div>
                              <div
                                className={
                                  clickedBtn === "Backspace"
                                    ? "num-btn num-pressed"
                                    : "num-btn"
                                }
                              >
                                <button
                                  onClick={() => {
                                    setClickedBtn("Backspace");
                                    setRefillMessage(null);
                                    setRefillAmount((amount) =>
                                      amount?.slice(0, amount.length - 1)
                                    );
                                    setTimeout(() => setClickedBtn(null), 250);
                                    refillInput.current.focus();
                                  }}
                                >
                                  <ArrowBackIcon />
                                </button>
                              </div>
                              <div
                                className={
                                  clickedBtn === "Enter"
                                    ? "confirm-btn num-pressed"
                                    : "confirm-btn"
                                }
                              >
                                <button onClick={confirmRefill}>CONFIRM</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : openFriendsDrawer && !isSmallScreen ? (
                    <div className="profile-page">
                      <div
                        className={
                          isDark
                            ? "page-title-wrapper dark"
                            : "page-title-wrapper"
                        }
                      >
                        <h2 className="page-title">
                          <ArrowBackIcon
                            onClick={() => {
                              setActiveIndex(0);
                              setTimeout(() => setOpenFriendsDrawer(false), 500);
                            }}
                          />{" "}
                          Referrals
                        </h2>
                      </div>
                      <div
                        className={
                          isDark
                            ? "referral-program-wrapper list dark"
                            : "referral-program-wrapper list"
                        }
                      >
                        <ReferredFriendsList />
                      </div>
                    </div>
                  ) : (
                    <div className="profile-page">
                      <div
                        className={
                          isDark
                            ? "page-title-wrapper dark"
                            : "page-title-wrapper"
                        }
                      >
                        <h2 className="page-title">
                          <ArrowBackIcon onClick={() => setActiveIndex(0)} />{" "}
                          Settings
                        </h2>
                      </div>
                      <div
                        className={
                          isDark
                            ? "page-content-settings dark"
                            : "page-content-settings"
                        }
                      >
                        <label htmlFor="profile-input">
                          <img
                            className="user-profile-picture"
                            src={profileImage?.url || defaultPic}
                            alt="userdp"
                            draggable={false}
                          />
                          <h4>Change Profile Photo</h4>
                        </label>
                        <input
                          id="profile-input"
                          type="file"
                          accept="image/*"
                          onChange={profileImageSelectionHandler}
                        />
                      </div>

                      <div
                        className={
                          isDark ? "user-settings dark" : "user-settings"
                        }
                      >
                        <div className="user-settings-form-wrapper">
                          <div className="user-settings-form">
                            <form>
                              <label htmlFor="name">Name</label>
                              <input
                                type="text"
                                id="name"
                                placeholder="Your name"
                                value={profileName}
                                onChange={handleProfileNameChange}
                              />
                            </form>
                            <h5></h5>
                            {profileName.trim() !== user?.name && (
                              <h6 onClick={updateUserFullName}>Update</h6>
                            )}
                          </div>
                          <div className="user-settings-form">
                            <form onClick={() => setActiveIndex(2)}>
                              <label htmlFor="name">Phone</label>
                              <PhoneInput
                                value={`+${user?.phone_country_code}${user?.phone_number}`}
                                placeholder="+91 XXXXX-XXXXX"
                                disableDropdown={true}
                                disabled={true}
                              />
                              <CheckGreenIcon />
                            </form>
                            <h5></h5>

                            <ChevronRight />
                          </div>
                          <div className="user-settings-form" onClick={() => setActiveIndex(3)}>
                            <form>
                              <label htmlFor="grade">Grade</label>
                              <span>{getGradeNameByValue(user?.grade)}</span>
                              {/*<select*/}
                              {/*  name="grade"*/}
                              {/*  id="grade"*/}
                              {/*  onChange={handleGradeChange}*/}
                              {/*>*/}
                              {/*  {grades.map(({ name, value }) => (*/}
                              {/*    <option*/}
                              {/*      value={value}*/}
                              {/*      selected={user?.grade === value}*/}
                              {/*      key={value}*/}
                              {/*    >*/}
                              {/*      {name}*/}
                              {/*    </option>*/}
                              {/*  ))}*/}
                              {/*</select>*/}
                            </form>
                            <ChevronRight />
                          </div>
                        </div>
                        <h6>
                          <span
                            onClick={() => {
                              setDocumentToShow(termsOfService);
                              setShowPDF(true);
                            }}
                          >
                            Terms of Service
                          </span>
                        </h6>
                        <h6>
                          <span
                            onClick={() => {
                              setDocumentToShow(privacyPolicy);
                              setShowPDF(true);
                            }}
                          >
                            Privacy Policy
                          </span>
                        </h6>
                        <h6>
                          <span onClick={onLogOutBtnClick}>
                            Log Out {user?.email}
                          </span>
                        </h6>
                      </div>
                      <div className="poweredbySection">
                        <img
                          className="powered__by__icon"
                          src={isDark ? PustackLogoDark : PustackLogo}
                          alt="pustack-logo"
                          draggable={false}
                        />
                        <p className="poweredBy">Powered By PuStack Education</p>
                      </div>
                    </div>
                  )}
                  <div className="profile-page">
                    <div
                      className={
                        isDark ? "page-title-wrapper dark" : "page-title-wrapper"
                      }
                    >
                      <h2 className="page-title">
                        <ArrowBackIcon
                          onClick={() => {
                            setActiveIndex(1);
                            setOtpError(false);
                            setPhoneNumber(
                              user?.phone_country_code + user?.phone_number
                            );
                            setCountryCode(user?.phone_country_code);
                            setOtpError(false);
                            setOtpCode(Array(6).fill(""));
                            setOtpSent(false);
                            setSendingOtp(false);
                            setPhoneNumberError("");
                          }}
                        />{" "}
                        Phone Number
                      </h2>
                    </div>
                    {activeIndex === 2 && (
                      <div className={isDark ? "page-phone dark" : "page-phone"}>
                        <PhoneInput
                          country="in"
                          value={`+${user?.phone_country_code}${user?.phone_number}`}
                          preferredCountries={["us", "ae", "sg", "my", "in"]}
                          placeholder="+91 XXXXX-XXXXX"
                          inputProps={{ autoFocus: true }}
                          isValid={(_, country) => {
                            setCountryCode(country?.dialCode);
                            return true;
                          }}
                          onChange={(phone) => setPhoneNumber(phone)}
                        />

                        {user?.phone_country_code + user?.phone_number !==
                          phoneNumber && (
                          <h4 onClick={() => !otpSent && handleSendingOTP()}>
                            Update
                          </h4>
                        )}
                      </div>
                    )}

                    <div ref={(ref) => (recaptchaRef = ref)}>
                      <div id="recaptcha-container" />
                    </div>

                    {otpSent && (
                      <div
                        className={
                          isDark
                            ? "otp-verification-modal dark"
                            : "otp-verification-modal"
                        }
                      >
                        <div className="wrapper">
                          <div className="otp-verification-modal-inner">
                            <img src={smartPhone} alt="sp" draggable={false} />
                            <h5>OTP Verification</h5>
                            <h6>
                              <span>Enter OTP sent to</span> +{phoneNumber}
                            </h6>
                            <div
                              className={
                                otpError
                                  ? "otp-verification error"
                                  : "otp-verification"
                              }
                            >
                              <div>
                                {Array(6)
                                  .fill(0)
                                  .map((_, i) => (
                                    <div key={i}>
                                      <input
                                        name={`input${i}`}
                                        type="tel"
                                        value={otpCode[i]}
                                        maxLength={1}
                                        autoFocus={i === 0}
                                        autoComplete="off"
                                        onChange={(e) => handleOTPChange(e, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                            {otpError && <h3>{otpError || 'Verification failed, try again.'}</h3>}
                            <div
                              className={
                                resendCode ? "resend__code grey" : "resend__code"
                              }
                            >
                              <Timer
                                initialTime={30100}
                                direction="backward"
                                checkpoints={[
                                  {
                                    time: 1500,
                                    callback: () => setPlural(false),
                                  },
                                  {
                                    time: 500,
                                    callback: () => setResendCode(false),
                                  },
                                ]}
                              >
                                {({ start, reset }) => (
                                  <h4
                                    onClick={() => {
                                      if (!resendCode) {
                                        setPlural(true);
                                        reset();
                                        start();
                                        setResendCode(true);
                                        handleSendingOTP();
                                      }
                                    }}
                                  >
                                    Resend OTP
                                    {resendCode && (
                                      <>
                                        ? Tap in <Timer.Seconds /> second
                                        {plural && "s"}
                                      </>
                                    )}
                                  </h4>
                                )}
                              </Timer>
                            </div>
                            <button
                              disabled={!allowNext}
                              onClick={() => handlePhoneNumberChange()}
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={"grade_change-modal" + (isDark ? ' dark' : '')}>
                    <div className="grade_change-header">
                      <ArrowBackIcon
                        onClick={() => {
                          navigator && navigator.vibrate && navigator.vibrate(5);
                          setActiveIndex(1);
                        }}
                      />
                      <h2>Update Grade</h2>
                      {/*<div className="grade_change-header-close_icon" onClick={() => setOpenGradeChangeModal(false)}>*/}
                      {/*  <CloseIcon/>*/}
                      {/*</div>*/}
                    </div>
                    <div className={"grade_change-item-container" + (changingGrade ? ' changing' : '')}>
                      {grades.map(gradeItem => (
                        <div onClick={() => handleGradeChange(gradeItem.value)} className={"grade_change-item" + (activeGradeItemInModal === gradeItem.value || user?.grade === gradeItem.value ? ' active' : '')}>
                          <img style={{opacity: changingGrade === gradeItem.value ? 0 : 1}} src={gradeItem.planet} alt={gradeItem.name}/>
                          <h4 style={{opacity: changingGrade === gradeItem.value ? 0 : 1}}>{gradeItem.name}</h4>
                          <div className="loader" style={{opacity: changingGrade === gradeItem.value ? 1 : 0}}>
                            <Lottie
                              options={{ animationData: circularProgress, loop: true }}
                            />
                          </div>
                        </div>
                      ))}
                      {/*<button className="green" onClick={() => handleGradeChange(activeGradeItemInModal)}>*/}
                      {/*  <span style={{opacity: changingGrade ? 0 : 1}}>Save</span>*/}
                      {/*  <div className="loader" style={{opacity: changingGrade ? 1 : 0}}>*/}
                      {/*    <Lottie*/}
                      {/*      options={{ animationData: circularProgress, loop: true }}*/}
                      {/*    />*/}
                      {/*  </div>*/}
                      {/*</button>*/}
                      {/*<button onClick={() => setOpenGradeChangeModal(false)}>Close</button>*/}
                    </div>
                  </div>
                </SwipeableViews>
              )}
            </Menu>
            <Modal
              shouldCloseOnEsc={true}
              shouldCloseOnOverlayClick={true}
              onRequestClose={handleLearnMoreClose}
              ariaHideApp={false}
              overlayClassName="new-post-modal-overlay"
              isOpen={openLearnMore[0]}
              className={
                isDark
                  ? "referral-program-wrapper dark"
                  : "referral-program-wrapper"
              }
            >
              <ReferralProgramInfo />
            </Modal>
            <Drawer
              variant="temporary"
              open={openLearnMore[1]}
              anchor={"bottom"}
              onClose={() => {
                handleLearnMoreClose();
                navigator && navigator.vibrate && navigator.vibrate(5);
              }}
              ModalProps={{ keepMounted: true }}
              className="referral-drawer"
            >
              <div
                className={
                  isDark
                    ? "referral-program-wrapper dark"
                    : "referral-program-wrapper"
                }
              >
                <div className="drawer-dash"></div>
                <ReferralProgramInfo />
              </div>
            </Drawer>
            {!isSmallScreen ? (
              <Modal
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
                onRequestClose={() => setFriendDetails(null)}
                ariaHideApp={false}
                overlayClassName="new-post-modal-overlay"
                isOpen={friendDetails}
                className={
                  isDark
                    ? "referral-program-wrapper dark"
                    : "referral-program-wrapper"
                }
              >
                <ReferredFriendInfo />
              </Modal>
            ) : (
              <Drawer
                variant="temporary"
                open={friendDetails}
                anchor={"bottom"}
                onClose={() => {
                  setFriendDetails(null);
                  navigator && navigator.vibrate && navigator.vibrate(5);
                }}
                ModalProps={{ keepMounted: true }}
                className="referral-drawer"
              >
                <div
                  className={
                    isDark
                      ? "referral-program-wrapper dark"
                      : "referral-program-wrapper"
                  }
                >
                  <div className="drawer-dash"></div>
                  <ReferredFriendInfo />
                </div>
              </Drawer>
            )}

            <Modal
              shouldCloseOnEsc={true}
              shouldCloseOnOverlayClick={true}
              onRequestClose={() => setOpenSharableModal(false)}
              ariaHideApp={false}
              overlayClassName="new-post-modal-overlay"
              isOpen={openSharableModal}
              className={
                isDark
                  ? "referral-program-wrapper dark"
                  : "referral-program-wrapper"
              }
            >
              <div className="referral-program">
                <h1>Share</h1>
                <img
                  src={referralImage}
                  alt="referral"
                  className="referral-banner"
                />
                <p>Invite your friends to sign up through this referral link</p>
                <CancelIcon
                  className="close-referral-modal"
                  onClick={() => setOpenSharableModal(false)}
                />
                <h4>
                  <span onClick={copyToClipBoard}>{referralLink}</span>
                  <FileCopyOutlinedIcon onClick={copyToClipBoard} />
                </h4>
                <div className="share-icons">
                  <EmailShareButton
                    subject="PuStack invitation link"
                    body={`Visit this link to get 30 days of PuStack Pro membership ${referralLink}`}
                    url={referralLink}
                    windowHeight={52}
                    windowWidth={52}
                  >
                    <EmailIcon size={52} round />
                  </EmailShareButton>
                  <FacebookShareButton
                    quote={`Visit this link to get 30 days of PuStack Pro membership ${referralLink}`}
                    url={referralLink}
                    windowHeight={52}
                    windowWidth={52}
                  >
                    <FacebookIcon size={52} round />
                  </FacebookShareButton>
                  <TelegramShareButton
                    url={referralLink}
                    title="PuStack invitation link"
                    windowHeight={52}
                    windowWidth={52}
                    className="telegram-btn"
                  >
                    <TelegramIcon size={52} round />
                  </TelegramShareButton>
                  <TwitterShareButton
                    url={referralLink}
                    title="PuStack invitation link"
                    windowHeight={52}
                    windowWidth={52}
                  >
                    <TwitterIcon size={52} round />
                  </TwitterShareButton>
                  <WhatsappShareButton
                    url={referralLink}
                    title="PuStack invitation link"
                    seperator=": "
                    windowHeight={52}
                    windowWidth={52}
                    className="whatsapp-btn"
                  >
                    <WhatsappIcon size={52} round />
                  </WhatsappShareButton>
                </div>
              </div>
            </Modal>

            <Drawer
              variant="temporary"
              open={isOpen}
              id={isDark ? "dark-menu" : "light-menu"}
              anchor={"right"}
              onClose={handleDrawerClose}
              className={
                isDark ? "account-setting-slider dark" : "account-setting-slider"
              }
              ModalProps={{ keepMounted: true }}
            >
              <SwipeableViews
                axis={"x"}
                scrolling={"false"}
                index={activeIndex}
                style={{ outline: "none", width: "100vw" }}
                ignoreNativeScroll={true}
                disabled={true}
              >
                <div>
                  <div
                    className={
                      activeIndex === 0
                        ? "profile-page"
                        : "profile-page settings-page"
                    }
                  >
                    <div
                      className={
                        isDark ? "page-title-wrapper dark" : "page-title-wrapper"
                      }
                    >
                      <h2 className="page-title">
                        <ArrowBackIcon onClick={handleDrawerClose} />
                      </h2>
                      <img
                        onClick={() => {
                          setActiveIndex(1);
                          history.push(
                            `${
                              currentPath === "/"
                                ? ""
                                : "/" + currentPath.replace(/\//g, "")
                            }/?page=settings`
                          );
                        }}
                        src={settingsIcon}
                        alt="SI"
                        draggable={false}
                      />
                    </div>
                    <div className="page-content">
                      <div className="user-card">
                        <img
                          className={"user-card-background"}
                          src={goldCard}
                          alt="user-card-background"
                          draggable={false}
                        />
                        <img
                          className="user-profile-picture"
                          src={user?.profile_url ? user?.profile_url : defaultPic}
                          onClick={() => {
                            setActiveIndex(1);
                            history.push(
                              `${
                                currentPath === "/"
                                  ? ""
                                  : "/" + currentPath.replace(/\//g, "")
                              }/?page=settings`
                            );
                          }}
                          alt="userdp"
                          draggable={false}
                        />
                        <img
                          src={PustackLogoGold}
                          alt="gold"
                          className="pustack-gold"
                          draggable={false}
                        />
                        <img
                          className={
                            !user?.is_external_instructor
                              ? "user-card-sim"
                              : "user-card-sim external"
                          }
                          src={goldSim}
                          alt="user-card-sim"
                          draggable={false}
                        />
                        {!user?.is_external_instructor && (
                          <div
                            className="wallet-balance"
                            // onClick={async () => {
                            //   const isBusy = await isStudentBusy();
                            //   if (!isBusy) {
                            //     setOpenRefillPage(true);
                            //     setActiveIndex(1);
                            //   } else {
                            //     setMessage("You are busy in a blaze session");
                            //     setOpenSnack(true);
                            //     setTimeout(() => setOpenSnack(false), 2500);
                            //   }
                            // }}
                            onClick={() => {
                              setMessage("Wallet access coming soon");
                              setOpenSnack(true);
                              setTimeout(() => setOpenSnack(false), 5000);
                            }}
                          >
                            <h2>Wallet Balance</h2>
                            <h6>
                              ₹{" "}
                              {user?.balance
                                ? user?.balance?.toLocaleString("en-IN")
                                : 0}
                            </h6>
                          </div>
                        )}
                        <div className="user-card-details">
                          <div className="user-tier-wrapper">
                            <div className="user-tier">
                              <h5 className="user-tier-tag">
                                {isUserPro ? "PRO" : "Basic"}
                              </h5>
                              {isUserPro && (
                                <>
                                  <h4>
                                    <span>VALID</span>
                                    <span>THRU</span>
                                  </h4>
                                  <h6>{expiryDate && expiryDate}</h6>
                                </>
                              )}
                            </div>
                            <div className="user-details">
                              <h6>{user?.name}</h6>
                            </div>
                          </div>
                          <div className={"user-validity"}>
                            <img
                              src={memberSince}
                              alt="member-since"
                              draggable={false}
                            />
                            <h6>{new Date(user?.sign_up_ts).getFullYear()}</h6>
                          </div>
                        </div>
                      </div>

                      <div className="user-scrollable">
                        <div className="user-experience">
                          <div
                            className={
                              isDark ? "user-star-rate dark" : "user-star-rate"
                            }
                          >
                            {!hasRated ? (
                              <>
                                <h6>Rate Experience</h6>
                                <StarRatings
                                  rating={rating}
                                  starRatedColor="#fec107"
                                  starHoverColor="#fec107"
                                  changeRating={changeRating}
                                  numberOfStars={5}
                                  starDimension="20px"
                                  starSpacing="2px"
                                  name="rating"
                                />
                              </>
                            ) : (
                              <div className="fadeIn">
                                <h5>Thank you for rating us</h5>
                                <span role="img" aria-label="smiley">
                                  😊
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            className={
                              isDark
                                ? "user-student-care dark"
                                : "user-student-care"
                            }
                            // onClick={() => {
                            //   setOpenChat(true);
                            //   setCloseCarePage(false);
                            // }}
                          >
                            <a
                              // to={`${
                              //   currentPath === "/"
                              //     ? ""
                              //     : "/" + currentPath.replace(/\//g, "")
                              // }/?page=care`}
                              href="https://api.whatsapp.com/send?phone=16504794112"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <WhatsApp />
                            </a>
                          </div>
                        </div>
                        <div className="user-related-section">
                          <div
                            className={
                              isDark
                                ? "user-pro-section dark"
                                : "user-pro-section"
                            }
                          >
                            <h6>PuStack Pro</h6>
                            <img
                              className="user-pro-mask-bg"
                              src={proMaskBg}
                              alt="pro-mask-bg"
                              draggable={false}
                            />
                            <div
                              className="user-pro-wrapper"
                              onClick={() => setIsSliderOpen(true)}
                            >
                              <img
                                className="user-pro-image astronaut"
                                src={astronaut}
                                alt="pro-img"
                                draggable={false}
                              />
                              <img
                                className="user-pro-image planet1"
                                src={planet1}
                                alt="pro-img"
                                draggable={false}
                              />
                              <img
                                className="user-pro-image planet2"
                                src={planet2}
                                alt="pro-img"
                                draggable={false}
                              />
                              <img
                                className="user-pro-image planet3"
                                src={planet3}
                                alt="pro-img"
                                draggable={false}
                              />
                            </div>
                            <div className="view-benefits-wrapper">
                              <button
                                className={
                                  isDark ? "view-benefits dark" : "view-benefits"
                                }
                                onClick={openProSlider}
                              >
                                {isUserPro ? "View Benefits" : "Join Pro"}
                              </button>
                            </div>
                          </div>
                          <div
                            className={
                              isDark ? "theme-toggle dark" : "theme-toggle"
                            }
                          >
                            <h6>Theme</h6>
                            <h5>Light</h5>
                            <h4>Dark</h4>
                            <div className={isDark ? "switch dark" : "switch"}>
                              <Switch
                                onChange={() => setIsDark(!isDark)}
                                checked={isDark}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor={"#161616"}
                                offColor={"#fff"}
                                width={70}
                                checkedHandleIcon={
                                  <div className="switch-knob"></div>
                                }
                                uncheckedHandleIcon={
                                  <div className="switch-knob"></div>
                                }
                              />
                            </div>
                          </div>
                        </div>
                        {totalSeconds > 0 && (
                          <div
                            className={
                              isDark
                                ? "user-analytics-chart dark"
                                : "user-analytics-chart"
                            }
                          >
                            <h6>Analytics</h6>
                            <UserAnalytics aspectRatio={2} />
                          </div>
                        )}
                        <div
                          className={
                            isDark ? "dropdown__footer dark" : "dropdown__footer"
                          }
                        >
                          <p>
                            <p
                              onClick={() => {
                                setDocumentToShow(termsOfService);
                                navigator && navigator.vibrate && navigator.vibrate(5);
                                setShowPDF(true);
                              }}
                            >
                              Terms of Service
                            </p>{" "}
                            <span>•</span>{" "}
                            <p
                              onClick={() => {
                                setDocumentToShow(privacyPolicy);
                                navigator && navigator.vibrate && navigator.vibrate(5);
                                setShowPDF(true);
                              }}
                            >
                              Privacy Policy
                            </p>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {openRefillPage ? (
                    <div className="profile-page">
                      <div
                        className={
                          isDark
                            ? "page-title-wrapper dark"
                            : "page-title-wrapper"
                        }
                      >
                        <h2 className="page-title">
                          <ArrowBackIcon
                            onClick={() => {
                              setActiveIndex(0);
                              setOpenRefillPage(false);
                              setOrderStatus(false);
                              setOrderId(null);
                              setProcessingRefill(false);
                              setProcessingOrder(false);
                              setRefillAmount("");
                              setOrderSuccessfull(false);
                              navigator && navigator.vibrate && navigator.vibrate(5);
                            }}
                          />
                          Add Wallet Balance
                        </h2>
                      </div>
                      <div className="pos-div">
                        <div className="pos-wrapper">
                          <div
                            className={
                              orderStatus ? "pos-receipt" : "pos-receipt-hidden"
                            }
                          >
                            <img
                              src={PosReceiptOriginal}
                              alt="receipt"
                              draggable={false}
                            />
                          </div>

                          {orderStatus && (
                            <div className="pos-full-receipt">
                              <img
                                src={PosReceipt}
                                alt="receipt"
                                draggable={false}
                              />
                              <div className="pos-receipt-details">
                                <div className="receipt-head">
                                  <img src={nounBook} alt="logo" />
                                  <h1>PuStack Wallet</h1>
                                </div>

                                <div className="receipt-details">
                                  <div className="receipt-line">
                                    <h2>PuStack Category</h2>
                                    <h4>PuStack Credit</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Date</h2>
                                    <h4>{format(new Date(), "MMM do")}</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Amount</h2>
                                    <h4>₹ {refillAmount}</h4>
                                  </div>
                                  <div className="receipt-line">
                                    <h2>Transaction Status</h2>
                                    <h4>{orderStatus ? "Success" : "Failure"}</h4>
                                  </div>
                                </div>
                                <div className="receipt-total">
                                  <h1>TOTAL</h1> <h4>₹ {refillAmount}</h4>
                                </div>
                                <div className="receipt-bar">
                                  <img
                                    src={BarCode}
                                    alt="barcode"
                                    draggable={false}
                                  />
                                  <h4>order_{orderId}</h4>
                                  <p>Thank you for your purchase</p>
                                </div>
                              </div>
                              <div className="order-completed-btns">
                                <button
                                  className="refill-more"
                                  onClick={() => {
                                    setOrderStatus(false);
                                    setOrderId(null);
                                    setProcessingRefill(false);
                                    setProcessingOrder(false);
                                    setRefillAmount("");
                                    setOrderSuccessfull(false);
                                  }}
                                >
                                  Add More
                                </button>
                                <button
                                  className="show-balance"
                                  onClick={() => {
                                    setActiveIndex(0);
                                    setOpenRefillPage(false);
                                    setOrderStatus(false);
                                    setOrderId(null);
                                    setProcessingRefill(false);
                                    setProcessingOrder(false);
                                    setRefillAmount("");
                                    setOrderSuccessfull(false);
                                  }}
                                >
                                  Show Balance
                                </button>
                              </div>
                            </div>
                          )}
                          <div className={orderStatus ? "hide-pos" : ""}>
                            <img
                              className="pos-original"
                              src={PosOriginal}
                              alt="posoriginal"
                              draggable={false}
                            />
                            <img
                              className="pos-top"
                              src={Pos}
                              alt="pos"
                              draggable={false}
                            />
                            <div className="pos-card">
                              <UserCard />
                            </div>
                            <div className="pos-screen">
                              {processingOrder ? (
                                processingRefill ? (
                                  <>
                                    <h5>Processing Order...</h5>
                                    <div className="pos-refilling">
                                      <Lottie
                                        options={{
                                          animationData: circularProgress,
                                          loop: true,
                                        }}
                                      />
                                    </div>
                                  </>
                                ) : orderSuccessfull ? (
                                  <div className="pos-status">
                                    <Lottie
                                      options={{
                                        animationData: confirmedLottie,
                                        loop: false,
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="pos-status">
                                    <Lottie
                                      options={{
                                        animationData: failureLottie,
                                        loop: false,
                                      }}
                                    />
                                  </div>
                                )
                              ) : processingRefill ? (
                                <>
                                  <h5>Processing Refill...</h5>
                                  <div className="pos-refilling">
                                    <Lottie
                                      options={{
                                        animationData: circularProgress,
                                        loop: true,
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h5>Enter Refill Amount: </h5>
                                  <h3>
                                    ₹
                                    <input
                                      type="number"
                                      min={24}
                                      max={99999}
                                      value={
                                        Number(refillAmount) > 0
                                          ? Number(refillAmount)
                                          : ""
                                      }
                                      ref={refillInput}
                                      onChange={(e) => posInputChange(e)}
                                      onKeyDown={(e) => {
                                        navigator && navigator.vibrate && navigator.vibrate(5);
                                        if (e.key === "Backspace")
                                          setClickedBtn(e.key);
                                        else setClickedBtn(Number(e.key));
                                        setTimeout(
                                          () => setClickedBtn(null),
                                          250
                                        );
                                      }}
                                    />
                                  </h3>
                                </>
                              )}
                            </div>
                            <div className="num-pad">
                              {numbers.map((num) => (
                                <div
                                  className={
                                    clickedBtn === num
                                      ? "num-btn num-pressed"
                                      : "num-btn"
                                  }
                                  key={num}
                                  onClick={() => posKeyPress(num)}
                                >
                                  <button>{num}</button>
                                </div>
                              ))}
                              <div className="num-btn">
                                <button></button>
                              </div>
                              <div
                                className={
                                  clickedBtn === 0
                                    ? "num-btn num-pressed"
                                    : "num-btn"
                                }
                              >
                                <button onClick={() => posKeyPress(0)}>0</button>
                              </div>
                              <div
                                className={
                                  clickedBtn === "Backspace"
                                    ? "num-btn num-pressed"
                                    : "num-btn"
                                }
                              >
                                <button
                                  onClick={() => {
                                    setRefillAmount((amount) =>
                                      amount?.slice(0, amount.length - 1)
                                    );
                                    navigator && navigator.vibrate && navigator.vibrate(5);
                                    setClickedBtn("Backspace");
                                    setTimeout(() => setClickedBtn(null), 250);
                                  }}
                                >
                                  <ArrowBackIcon />
                                </button>
                              </div>
                              <div
                                className={
                                  clickedBtn === "confirm"
                                    ? "confirm-btn num-pressed"
                                    : "confirm-btn"
                                }
                              >
                                <button onClick={confirmRefill}>CONFIRM</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-page">
                      <div
                        className={
                          isDark
                            ? "page-title-wrapper dark"
                            : "page-title-wrapper"
                        }
                      >
                        <h2 className="page-title">
                          <ArrowBackIcon
                            onClick={() => {
                              navigator && navigator.vibrate && navigator.vibrate(5);
                              setActiveIndex(0);
                              history.push(
                                `${
                                  currentPath === "/"
                                    ? ""
                                    : "/" + currentPath.replace(/\//g, "")
                                }/?page=account`
                              );
                            }}
                          />
                          Settings
                        </h2>
                      </div>
                      <div
                        className={
                          isDark
                            ? "page-content-settings dark"
                            : "page-content-settings"
                        }
                      >
                        <label htmlFor="profile-input">
                          <img
                            className="user-profile-picture"
                            src={profileImage?.url || defaultPic}
                            alt="userdp"
                            draggable={false}
                          />
                          <h4>Change Profile Photo</h4>
                        </label>
                        <input
                          id="profile-input"
                          type="file"
                          accept="image/*"
                          onChange={profileImageSelectionHandler}
                        />
                      </div>

                      <div
                        className={
                          isDark ? "user-settings dark" : "user-settings"
                        }
                      >
                        <div className="user-settings-form-wrapper">
                          <div className="user-settings-form">
                            <form>
                              <label htmlFor="name">Name</label>
                              <input
                                type="text"
                                id="name"
                                placeholder="Your name"
                                value={profileName}
                                onChange={handleProfileNameChange}
                                onMouseDown={() => setHidePoweredBy(true)}
                                onMouseLeave={() =>
                                  setTimeout(() => setHidePoweredBy(false), 1000)
                                }
                              />
                            </form>
                            <h5></h5>

                            {profileName.trim() !== user?.name && (
                              <h6 onClick={updateUserFullName}>Update</h6>
                            )}
                          </div>
                          <div className="user-settings-form">
                            <form
                              onClick={() => {
                                setActiveIndex(2);
                                history.push(
                                  `${
                                    currentPath === "/"
                                      ? ""
                                      : "/" + currentPath.replace(/\//g, "")
                                  }/?page=change-phone`
                                );
                              }}
                            >
                              <label htmlFor="name">Phone</label>

                              <PhoneInput
                                value={`+${user?.phone_country_code}${user?.phone_number}`}
                                placeholder="+91 XXXXX-XXXXX"
                                disableDropdown={true}
                                disabled={true}
                                onClick={() => {
                                  setActiveIndex(2);
                                  history.push(
                                    `${
                                      currentPath === "/"
                                        ? ""
                                        : "/" + currentPath.replace(/\//g, "")
                                    }/?page=change-phone`
                                  );
                                }}
                              />
                              <CheckGreenIcon />
                            </form>
                            <h5></h5>

                            <ChevronRight />
                          </div>
                          <div className="user-settings-form" onClick={() => setActiveIndex(3)}>
                            <form>
                              <label htmlFor="grade">Grade</label>
                              <span>{getGradeNameByValue(user?.grade)}</span>
                              {/*<select*/}
                              {/*  name="grade"*/}
                              {/*  id="grade"*/}
                              {/*  onChange={handleGradeChange}*/}
                              {/*>*/}
                              {/*  {grades.map(({ name, value }) => (*/}
                              {/*    <option*/}
                              {/*      value={value}*/}
                              {/*      selected={user?.grade === value}*/}
                              {/*    >*/}
                              {/*      {name}*/}
                              {/*    </option>*/}
                              {/*  ))}*/}
                              {/*</select>*/}
                            </form>
                            <ChevronRight />
                          </div>
                        </div>
                        <h6>
                          <span
                            onClick={() => {
                              setDocumentToShow(termsOfService);
                              setShowPDF(true);
                            }}
                          >
                            Terms of Service
                          </span>
                        </h6>
                        <h6>
                          <span
                            onClick={() => {
                              setDocumentToShow(privacyPolicy);
                              setShowPDF(true);
                            }}
                          >
                            Privacy Policy
                          </span>
                        </h6>
                        <h6>
                          <span onClick={onLogOutBtnClick}>
                            Log Out {user?.email}
                          </span>
                        </h6>
                      </div>
                      {!hidePoweredBy && (
                        <div className="poweredbySection">
                          <img
                            className="powered__by__icon"
                            src={isDark ? PustackLogoDark : PustackLogo}
                            alt="pustack-logo"
                            draggable={false}
                          />
                          <p className="poweredBy">
                            Powered By PuStack Education
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="profile-page">
                  <div
                    className={
                      isDark ? "page-title-wrapper dark" : "page-title-wrapper"
                    }
                  >
                    <h2 className="page-title">
                      <ArrowBackIcon
                        onClick={() => {
                          setActiveIndex(1);
                          history.push(
                            `${
                              currentPath === "/"
                                ? ""
                                : "/" + currentPath?.replace(/\//g, "")
                            }/?page=settings`
                          );
                        }}
                      />{" "}
                      Phone Number
                    </h2>
                  </div>
                  {isOpen && activeIndex === 2 && (
                    <div className={isDark ? "page-phone dark" : "page-phone"}>
                      <div ref={(ref) => (recaptchaRef = ref)}>
                        <div id="recaptcha-container" />
                      </div>
                      <PhoneInput
                        country="in"
                        value={`+${user?.phone_country_code}${user?.phone_number}`}
                        preferredCountries={["us", "ae", "sg", "my", "in"]}
                        placeholder="+91 XXXXX-XXXXX"
                        inputProps={{ autoFocus: activeIndex === 2 }}
                        isValid={(_, country) => {
                          setCountryCode(country?.dialCode);
                          return true;
                        }}
                        onChange={(phone) => setPhoneNumber(phone)}
                      />

                      {user?.phone_country_code + user?.phone_number !==
                        phoneNumber && (
                        <h4 onClick={() => handleSendingOTP()}>Update</h4>
                      )}
                    </div>
                  )}
                  {otpSent && (
                    <div
                      className={
                        isDark
                          ? "otp-verification-modal dark"
                          : "otp-verification-modal"
                      }
                    >
                      <div className="wrapper">
                        <div className="otp-verification-modal-inner">
                          <img src={smartPhone} alt="sp" draggable={false} />

                          <h5>OTP Verification</h5>
                          <h6>
                            <span>Enter OTP sent to</span> +{phoneNumber}
                          </h6>
                          <div
                            className={
                              otpError
                                ? "otp-verification error"
                                : "otp-verification"
                            }
                          >
                            <div>
                              {Array(6)
                                .fill(0)
                                .map((_, i) => (
                                  <div key={i}>
                                    <input
                                      name={`input${i}`}
                                      type="tel"
                                      value={otpCode[i]}
                                      maxLength={1}
                                      autoFocus={i === 0}
                                      autoComplete="off"
                                      onChange={(e) => handleOTPChange(e, i)}
                                      onKeyDown={(e) => handleKeyDown(e, i)}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                          {otpError && <h3>Verification failed, try again.</h3>}
                          <div
                            className={
                              resendCode ? "resend__code grey" : "resend__code"
                            }
                          >
                            <Timer
                              initialTime={30100}
                              direction="backward"
                              checkpoints={[
                                {
                                  time: 1500,
                                  callback: () => setPlural(false),
                                },
                                {
                                  time: 500,
                                  callback: () => setResendCode(false),
                                },
                              ]}
                            >
                              {({ start, reset }) => (
                                <h4
                                  onClick={() => {
                                    if (!resendCode) {
                                      setPlural(true);
                                      reset();
                                      start();
                                      setResendCode(true);
                                      handleSendingOTP();
                                    }
                                  }}
                                >
                                  Resend OTP
                                  {resendCode && (
                                    <>
                                      ? Tap in <Timer.Seconds /> second
                                      {plural && "s"}
                                    </>
                                  )}
                                </h4>
                              )}
                            </Timer>
                          </div>
                          <button
                            disabled={!allowNext}
                            onClick={() => handlePhoneNumberChange()}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={"grade_change-modal" + (isDark ? ' dark' : '')}>
                  <div className="grade_change-header">
                    <ArrowBackIcon
                      onClick={() => {
                        navigator && navigator.vibrate && navigator.vibrate(5);
                        setActiveIndex(1);
                      }}
                    />
                    <h2>Update Grade</h2>
                    {/*<div className="grade_change-header-close_icon" onClick={() => setOpenGradeChangeModal(false)}>*/}
                    {/*  <CloseIcon/>*/}
                    {/*</div>*/}
                  </div>
                  <div className={"grade_change-item-container" + (changingGrade ? ' changing' : '')}>
                    {grades.map(gradeItem => (
                      <div onClick={() => handleGradeChange(gradeItem.value)} className={"grade_change-item" + (activeGradeItemInModal === gradeItem.value || user?.grade === gradeItem.value ? ' active' : '')}>
                        <img style={{opacity: changingGrade === gradeItem.value ? 0 : 1}} src={gradeItem.planet} alt={gradeItem.name}/>
                        <h4 style={{opacity: changingGrade === gradeItem.value ? 0 : 1}}>{gradeItem.name}</h4>
                        <div className="loader" style={{opacity: changingGrade === gradeItem.value ? 1 : 0}}>
                          <Lottie
                            options={{ animationData: circularProgress, loop: true }}
                          />
                        </div>
                      </div>
                    ))}
                    {/*<button className="green" onClick={() => handleGradeChange(activeGradeItemInModal)}>*/}
                    {/*  <span style={{opacity: changingGrade ? 0 : 1}}>Save</span>*/}
                    {/*  <div className="loader" style={{opacity: changingGrade ? 1 : 0}}>*/}
                    {/*    <Lottie*/}
                    {/*      options={{ animationData: circularProgress, loop: true }}*/}
                    {/*    />*/}
                    {/*  </div>*/}
                    {/*</button>*/}
                    {/*<button onClick={() => setOpenGradeChangeModal(false)}>Close</button>*/}
                  </div>
                </div>
              </SwipeableViews>
            </Drawer>

            <Drawer
              variant="temporary"
              open={openChat}
              anchor={"right"}
              onClose={() => {
                setOpenChat(false);
                setCloseCarePage(true);
              }}
              className={isDark ? "dark" : ""}
              ModalProps={{ keepMounted: true }}
            >
              {!closeCarePage && <PuStackCareMobile />}
            </Drawer>
            {isSmallScreen && (
              <Drawer
                variant="temporary"
                open={openFriendsDrawer}
                anchor={"bottom"}
                onClose={() => {
                  setOpenFriendsDrawer(false);
                  navigator && navigator.vibrate && navigator.vibrate(5);
                }}
                ModalProps={{ keepMounted: true }}
                className="referral-drawer"
              >
                <div
                  className={
                    isDark
                      ? "referral-program-wrapper list dark"
                      : "referral-program-wrapper list"
                  }
                >
                  <div className="drawer-dash"></div>
                  <ReferredFriendsList />
                </div>
              </Drawer>
            )}

            <Dialog open={showPDF} onClose={() => setShowPDF(false)}>
              {showPDF && (
                <PdfPreview
                  pdf={documentToShow}
                  onClose={() => setShowPDF(false)}
                />
              )}
            </Dialog>
          </div>
        ) : (
          <>
            <div className="header__right">
              <div className="header__info">
                <Link to="/signin">
                  <button className="answers__bottomButton">Signin</button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <Dialog c open={openGradeChangeModal} onClose={() => setOpenGradeChangeModal(false)}>
        <div className={"grade_change-modal" + (isDark ? ' dark' : '')}>
          <div className="grade_change-header">
            <h2>Update Grade</h2>
            <div className="grade_change-header-close_icon" onClick={() => setOpenGradeChangeModal(false)}>
              <CloseIcon/>
            </div>
          </div>
          <div className="grade_change-item-container">
            {grades.map(gradeItem => (
              <div onClick={() => setActiveGradeItemInModal(gradeItem.value)} className={"grade_change-item" + (activeGradeItemInModal === gradeItem.value ? ' active' : '') + (user?.grade === gradeItem.value ? ' current' : '')}>
                <img src={gradeItem.planet} alt={gradeItem.name}/>
                <h4>{gradeItem.name}</h4>
              </div>
            ))}
            <button className="green" onClick={() => handleGradeChange(activeGradeItemInModal)}>
              <span style={{opacity: changingGrade ? 0 : 1}}>Save</span>
              <div className="loader" style={{opacity: changingGrade ? 1 : 0}}>
                <Lottie
                  options={{ animationData: circularProgress, loop: true }}
                />
              </div>
            </button>
            <button onClick={() => setOpenGradeChangeModal(false)}>Close</button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AccountSettings;



// <div className="user-invitation">
//   <img
//     src={isDark ? CouponShadowDark : CouponShadowLight}
//     alt="bg"
//     className="invitaion-bg-shadow"
//     draggable={false}
//   />
//   <div className="user-invitation-bg">
//     {isDark && <div className="stars" />}
//     {referredList?.length > 0 && (
//       <img
//         src={FriendIcon}
//         alt="friends"
//         className={
//           isDark
//             ? "invited-friends dark"
//             : "invited-friends"
//         }
//         onClick={() => setOpenFriendsList(!openFriendsList)}
//         draggable={false}
//       />
//     )}
//     <div className="invitation-image">
//       <img
//         src={EatPizza}
//         alt="eat-pizza"
//         draggable={false}
//       />
//     </div>
//     <div className="invitation-text">
//       <h1>SHARE &amp; EARN</h1>
//       <div
//         className={
//           isDark ? "thirty-days dark" : "thirty-days"
//         }
//       >
//         <img
//           className="thirty-back"
//           src={ThirtyBack}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-mid"
//           src={ThirtyMid}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-front shadow"
//           src={Thirty}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-front"
//           src={Thirty}
//           alt="30"
//           draggable={false}
//         />
//         <h5>DAYS FREE</h5>
//       </div>
//       <div className="invitation-btns">
//         <button
//           className={
//             isDark ? "invite-btn dark" : "invite-btn"
//           }
//           onClick={generateInviteLinkAndShare}
//         >
//           {generatingLink ? (
//             <Lottie
//               options={{
//                 animationData: circularProgress,
//                 loop: true,
//               }}
//             />
//           ) : (
//             "Invite Friends"
//           )}
//         </button>
//         <button
//           className="learn-btn"
//           onClick={() => setOpenLearnMore([true, false])}
//         >
//           Learn more
//         </button>
//       </div>
//     </div>
//   </div>
// </div>


// FOr Mobile view
// <div className="user-invitation">
//   <img
//     src={isDark ? CouponShadowDark : CouponShadowLight}
//     alt="bg"
//     className="invitaion-bg-shadow"
//     draggable={false}
//   />
//   <div className="user-invitation-bg">
//     {isDark && <div className="stars" />}
//     {referredList?.length > 0 && (
//       <img
//         src={FriendIcon}
//         alt="friends"
//         className={
//           isDark
//             ? "invited-friends dark"
//             : "invited-friends"
//         }
//         onClick={() => {
//           setOpenFriendsList(!openFriendsList);
//           navigator && navigator.vibrate && navigator.vibrate(5);
//         }}
//         draggable={false}
//       />
//     )}
//     <div className="invitation-image">
//       <img
//         src={EatPizza}
//         alt="eat-pizza"
//         draggable={false}
//       />
//     </div>
//     <div className="invitation-text">
//       <h1>SHARE &amp; EARN</h1>
//       <div
//         className={
//           isDark ? "thirty-days dark" : "thirty-days"
//         }
//       >
//         <img
//           className="thirty-back"
//           src={ThirtyBack}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-mid"
//           src={ThirtyMid}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-front shadow"
//           src={Thirty}
//           alt="30"
//           draggable={false}
//         />
//         <img
//           className="thirty-front"
//           src={Thirty}
//           alt="30"
//           draggable={false}
//         />
//         <h5>DAYS FREE</h5>
//       </div>
//       <div className="invitation-btns">
//         <button
//           className={
//             isDark ? "invite-btn dark" : "invite-btn"
//           }
//           onClick={generateInviteLinkAndShare}
//         >
//           {generatingLink ? (
//             <Lottie
//               options={{
//                 animationData: circularProgress,
//                 loop: true,
//               }}
//             />
//           ) : (
//             "Invite Friends"
//           )}
//         </button>
//         <button
//           className="learn-btn"
//           onClick={() => setOpenLearnMore([false, true])}
//         >
//           Learn more
//         </button>
//       </div>
//     </div>
/*  </div>*/
/*</div>*/
