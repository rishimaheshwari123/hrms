import { apiConnector } from "../apiConnector";
import { salary } from "../apis";
import { toast } from "react-toastify";

const { CREATE_SALARY, UPDATE_SALARY, GET_SALARY } = salary;

// 🔹 Create Salary
export async function createSalaryAPI(data, token) {
  const toastId = toast.loading("Creating salary record...");

  try {
    const response = await apiConnector(
      "POST",
      CREATE_SALARY,
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

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Details saved successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("CREATE SALARY ERROR:", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to create salary. Please try again later."
    );
  }
}

// 🔹 Update Salary
export async function updateSalaryAPI(data, token) {
  const toastId = toast.loading("Updating salary record...");

  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_SALARY,
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

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Details updated successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("UPDATE SALARY ERROR:", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to update salary. Please try again later."
    );
  }
}

// 🔹 Get Salary by ID
export async function getSalaryAPI(id, token) {
  const toastId = toast.loading("Fetching salary details...");

  try {
    // ✅ Send id in URL, not in body
    const response = await apiConnector(
      "GET",
      `${GET_SALARY}/${id}`, // <-- send as param
      null, // no body in GET
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    return response?.data?.data;
  } catch (error) {
    console.error("GET SALARY ERROR:", error);
    toast.dismiss(toastId);
    toast.error(
      error?.response?.data?.message ||
        "Failed to fetch salary. Please try again later."
    );
  }
}
