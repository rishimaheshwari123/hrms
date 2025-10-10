import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router
import { toast } from "react-toastify";
import { getAllEmployees, verifyEmployee } from "@/service/operations/auth";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const GetAllEmployee = () => {
  const navigate = useNavigate(); // useNavigate hook
  const {token} = useSelector((state : RootState) => state.auth)
  const [employees, setEmployees] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const fetchEmployees = async () => {
    const data = await getAllEmployees(token);
    if (data) {
      setEmployees(data);
      setFilteredEmployees(data);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search on button click
  const handleSearch = () => {
    const filtered = employees?.filter((emp) =>
      emp?.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      emp?.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
      emp?.phone?.toLowerCase().includes(searchInput.toLowerCase()) ||
      emp?.employeeCode?.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleVerify = async (id, status) => {
    await verifyEmployee(id, status, token);
    fetchEmployees();
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-employee/${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">All Employees</h1>

      {/* Search Input with Button */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by name, email, phone or code"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-1/3"
        />
        <Button onClick={handleSearch} className="px-4 py-2">
          Search
        </Button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <Table>
          <TableCaption>List of registered employees</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Employee Code</TableHead>
              <TableHead className="font-bold">Employment Status</TableHead>
              <TableHead className="font-bold">Active</TableHead>
              <TableHead className="font-bold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredEmployees?.length > 0 ? (
              filteredEmployees?.map((emp) => (
                <TableRow key={emp?._id}>
                  <TableCell>{emp?.name || "-"}</TableCell>
                  <TableCell>{emp?.email || "-"}</TableCell>
                  <TableCell>{emp?.phone || "-"}</TableCell>
                  <TableCell>{emp?.employeeCode || "Not verified yet"}</TableCell>
                  <TableCell>{emp?.employmentStatus || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        emp?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp?.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  {/* Action Dropdown + Edit Button */}
                  <TableCell className="text-center flex justify-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Action</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVerify(emp?._id, true)}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerify(emp?._id, false)}>
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Edit Button */}
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(emp?._id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell  className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GetAllEmployee;
