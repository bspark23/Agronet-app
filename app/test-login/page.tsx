"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers, getLocalStorageData } from "@/lib/local-storage-utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TestLoginPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [storageData, setStorageData] = useState<any>(null);
  const [oldStorageData, setOldStorageData] = useState<any>(null);

  useEffect(() => {
    // Get users from the new system
    const currentUsers = getUsers();
    setUsers(currentUsers);

    // Get full storage data
    const fullData = getLocalStorageData();
    setStorageData(fullData);

    // Check old storage
    if (typeof window !== "undefined") {
      const oldData = localStorage.getItem("agronet_data");
      if (oldData) {
        setOldStorageData(JSON.parse(oldData));
      }
    }
  }, []);

  const testLogin = (email: string, password: string) => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      alert(`Login successful! User: ${user.name}, Role: ${user.role}`);
    } else {
      alert("Login failed!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
          Login Test & Debug Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Available Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-red-500">No users found!</p>
                ) : (
                  users.map((user, index) => (
                    <div key={index} className="p-2 border rounded">
                      <p>
                        <strong>Name:</strong> {user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {user.role}
                      </p>
                      <Button
                        size="sm"
                        onClick={() =>
                          testLogin(user.email, user.password || "")
                        }
                        className="mt-2"
                      >
                        Test Login
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">
                    New Storage (harvestlink_data):
                  </h4>
                  <p>Users count: {storageData?.users?.length || 0}</p>
                  <p>
                    Has logistics:{" "}
                    {storageData?.logisticsCompanies ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Old Storage (agronet_data):</h4>
                  <p>Exists: {oldStorageData ? "Yes" : "No"}</p>
                  <p>Users count: {oldStorageData?.users?.length || 0}</p>
                </div>

                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("agronet_data");
                      localStorage.removeItem("harvestlink_data");
                      window.location.reload();
                    }
                  }}
                  variant="destructive"
                  size="sm"
                >
                  Clear All Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Test Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() =>
                  testLogin("adaoma2826@gmail.com", "Blessing2008")
                }
                className="bg-red-500 hover:bg-red-600"
              >
                Test Admin Login
              </Button>
              <Button
                onClick={() => testLogin("john.doe@example.com", "password123")}
                className="bg-green-500 hover:bg-green-600"
              >
                Test Seller Login
              </Button>
              <Button
                onClick={() => testLogin("chika@example.com", "password123")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Test Buyer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
