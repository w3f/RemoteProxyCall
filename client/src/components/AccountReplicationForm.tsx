import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReplicationRequestSchema } from "@shared/schema";

// Extend the schema with client-side validation
const formSchema = insertReplicationRequestSchema.extend({
  account: z.string().min(1, "Account is required"),
  pureProxyAccount: z.string().min(1, "Pure Proxy Account is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AccountReplicationForm() {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Set up form using react-hook-form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      pureProxyAccount: "",
    },
  });

  // Set up mutation for API request
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/replicate", data);
      return response.json();
    },
    onSuccess: () => {
      // Show success toast and state
      toast({
        title: "Replication requested",
        description: "Your replication request has been submitted successfully.",
      });
      setShowSuccess(true);
      
      // Reset the form
      form.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setShowSuccess(false);
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md bg-white rounded-lg shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Account Replication Tool</h1>
          <p className="text-gray-500 text-sm mt-1">Enter account details to replicate</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Account <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account ID"
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pureProxyAccount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Pure Proxy Account <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter pure proxy account ID"
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Processing..." : "Replicate"}
            </Button>
          </form>
        </Form>

        {/* Success message */}
        {showSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md" role="alert">
            <div className="flex">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <p>Replication successful!</p>
            </div>
          </div>
        )}

        {/* Error message is handled through toasts */}
        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md" role="alert">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{mutation.error instanceof Error ? mutation.error.message : "Please check the form for errors."}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
