import { apiConnector } from "../apiConnector";
import { image } from "../apis";
import { toast } from 'react-toastify';

const { IMAGE_UPLOAD } = image


export const imageUpload = async (data, token = null) => {
    let result = []
    console.log(data)
    const toastId = toast.loading("Loading...")
    try {

        const formData = new FormData();
        for (let i = 0; i < data.length; i++) {
            formData.append("thumbnail", data[i]);
        }
        const response = await apiConnector("POST", IMAGE_UPLOAD, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        })
        // console.log("CREATE IMAGE API RESPONSE............", response)
        if (!response?.data?.success) {
            throw new Error("Could Not Add IMAGE Details")
        }
        toast.success("IMAGE Details Added Successfully")
        result = response?.data?.images

    } catch (error) {
        console.log("CREATE IMAGE API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result

}




