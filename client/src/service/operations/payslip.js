import { apiConnector } from "../apiConnector";
import { payslip } from "../apis";
import { toast } from "react-toastify";

const { LIST, GENERATE } = payslip;

export async function listPayslipsAPI(employeeId, token) {
  const toastId = toast.loading("Fetching payslips...");
  try {
    const url = `${LIST}?employeeId=${employeeId}`;
    const response = await apiConnector("GET", url, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch payslips");
    }
    toast.dismiss(toastId);
    return response.data;
  } catch (error) {
    console.error("LIST PAYSLIPS ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to fetch payslips.");
  }
}

export async function generatePayslipAPI(payslipId, token) {
  const toastId = toast.loading("Generating payslip PDF...");
  try {
    const url = `${GENERATE}/${payslipId}`;
    const response = await apiConnector("POST", url, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to generate payslip PDF");
    }
    toast.dismiss(toastId);
    toast.success("Payslip PDF generated");
    return response.data;
  } catch (error) {
    console.error("GENERATE PAYSLIP ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to generate payslip PDF.");
  }
}