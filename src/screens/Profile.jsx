import { Button, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import GLOBAL_CONSTANTS from "../../GlobalConstants";
import { useDispatch } from "react-redux";
import { user_update } from "../redux/action";

export default function Profile() {
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const onLoginChange = (key, value) => {
    let temp = { ...loginData };
    temp[key] = value;
    setLoginData({ ...temp });
  };

  const onUpdate = () => {
    const payload = {
      username: loginData?.user_name,
      password: loginData?.password,
      email: loginData?.email,
      user_id: GLOBAL_CONSTANTS?.user_cred?.user_id,
    };

    dispatch(user_update(payload, () => {
      let tempData = JSON.parse(localStorage?.getItem("user_data"));
      tempData.data = {
        ...tempData.data,
        email: loginData?.email,
        user_name: loginData?.user_name,
      };
      
      localStorage.setItem("user_data", JSON.stringify(tempData));
    }));
  };

  useEffect(() => {
    setLoginData({
      user_name: JSON.parse(localStorage?.getItem("user_data"))?.data?.user_name,
      email: JSON.parse(localStorage?.getItem("user_data"))?.data?.email,
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        // background: "linear-gradient(1deg, #7b24d2 30%, #9c27b0)",
        background:'#C6DEFF',
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
          width: "90vw",
          maxWidth: "400px",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
          Account Details
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <TextField
            value={loginData?.user_name}
            label="User Name"
            onChange={(event) => onLoginChange("user_name", event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleOutlinedIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            value={loginData?.email}
            label="Email"
            onChange={(event) => onLoginChange("email", event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailOutlinedIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            value={loginData?.password}
            label="Password"
            onChange={(event) => onLoginChange("password", event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PasswordIcon color="secondary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon
                      color="secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(() => false)}
                    />
                  ) : (
                    <RemoveRedEyeOutlinedIcon
                      color="secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            type={showPassword ? "text" : "password"}
          />

          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={() => onUpdate()}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
