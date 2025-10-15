import { setUser, setToken } from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import Swal from "sweetalert2";
import {toast} from "react-toastify"
const {
  LOGIN_API, SIGNUP_API,GET_ALL_EMPLOYEE, GET_SINGLE_EMPLOYEE, VERIFY_EMPLOYEE, UPDATE_EMPLOYEE, SEND_DOC_TO_EMPLOYEE_BY_ADMIN, SEND_DOC_BY_EMPLOYEE
} = endpoints;

export async function login(email, password, dispatch) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", LOGIN_API, {
      email,
      password,
    });
    Swal.close();
    if (!response?.data?.success) {
      await Swal.fire({
        title: "Login Failed",
        text: response.data.message,
        icon: "error",
      });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Login Successfully!`,
      text: `Have a nice day!`,
      icon: "success",
    });
    dispatch(setToken(response?.data?.token));
    dispatch(setUser(response.data.user));
    // navigate("/admin/dashboard");
  } catch (error) {
    console.log("LOGIN API ERROR............", error);
    Swal.fire({
      title: "Login Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong, please try again later",
      icon: "error",
    });
  }
}

export async function signUp(formData) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", SIGNUP_API, formData);

    console.log("SIGNUP API RESPONSE............", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `User Register Succesfull!`,
      text: `Have a nice day!`,
      icon: "success",
    });

    return response?.data?.success;
  } catch (error) {
    console.log("SIGNUP API ERROR............", error);

    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Something went wrong. Please try again later.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  // Swal.close();
}


export async function getAllEmployees(token) {
  try {
    const response = await apiConnector("GET", GET_ALL_EMPLOYEE, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    return response?.data?.employees;
  } catch (error) {
    console.error("GET ALL EMPLOYEES ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to fetch employees.");
  }
}


export async function getEmployeeById(id, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_SINGLE_EMPLOYEE}/${id}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    return response?.data?.employee;
  } catch (error) {
    console.error("GET EMPLOYEE BY ID ERROR............", error);
    toast.error(
      error?.response?.data?.message || "Failed to fetch employee details."
    );
  }
}

export async function verifyEmployee(id, isActive, token) {
  const toastId = toast.loading("Updating employee status...");

  try {
    const response = await apiConnector(
      "PUT",
      `${VERIFY_EMPLOYEE}/${id}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Employee updated successfully!");

    return response?.data?.employee;
  } catch (error) {
    console.error("VERIFY EMPLOYEE ERROR............", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to update employee status. Please try again later."
    );
  }
}

export async function updateEmployeeAPI(id, data, token) {
  const toastId = toast.loading("Updating Employee...");

  try {

    const response = await apiConnector(
      "PUT",
      `${UPDATE_EMPLOYEE}/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    // Dismiss loading and show success
    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Employee updated successfully!");

    return response?.data?.employee;
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR............", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to update employee. Please try again later."
    );
  }
}

export async function sendAdminDocsToEmployee(id, formData, token) {
  const toastId = toast.loading("Sending Documents to Employee...");

  try {

   
    const response = await apiConnector(
      "POST",
      `${SEND_DOC_TO_EMPLOYEE_BY_ADMIN}/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Documents sent successfully!");

    return response?.data?.data; // returns updated employee
  } catch (error) {
    console.error("SEND ADMIN DOCS ERROR:", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to send documents. Please try again later."
    );
  }
}
export async function submiteEmpDocAPI(id, formData, token) {
  const toastId = toast.loading("Sending Documents...");

  try {

   
    const response = await apiConnector(
      "POST",
      `${SEND_DOC_BY_EMPLOYEE}/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Documents sent successfully!");

    return response?.data?.data; // returns updated employee
  } catch (error) {
    console.error("SEND ADMIN DOCS ERROR:", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to send documents. Please try again later."
    );
  }
}