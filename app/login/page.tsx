"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = login(email, password);
      if (success) {
        // Get the user data from the updated storage
        let userData = JSON.parse(
          localStorage.getItem("harvestlink_data") || "{}"
        );

        // Fallback to old storage if new storage is empty
        if (!userData.users || userData.users.length === 0) {
          const oldData = JSON.parse(
            localStorage.getItem("agronet_data") || "{}"
          );
          if (oldData.users) {
            userData = oldData;
          }
        }

        const user = userData.users?.find((u: any) => u.email === email);

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${user?.name || "user"}!`,
          variant: "success",
        });

        // Redirect based on user role
        if (user) {
          const dashboardPath = `/dashboard/${user.role}`;
          router.push(dashboardPath);
        } else {
          // Fallback to home page if user role is unclear
          router.push("/");
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-agronetGreen-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-agronetGreen">
          Login to HarvestLink
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white"
          >
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-agronetGreen hover:underline"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
