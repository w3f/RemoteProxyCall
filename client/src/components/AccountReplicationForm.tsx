import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
import { createProxyCall } from "@/lib/polkadotService";
import { Textarea } from "@/components/ui/textarea";

// Extend the schema with client-side validation
const formSchema = insertReplicationRequestSchema.extend({
  account: z.string().min(1, "Account is required"),
  pureProxyAccount: z.string().min(1, "Pure Proxy Account is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AccountReplicationForm() {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [proxyCallData, setProxyCallData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      // First store the request in our database
      const response = await apiRequest("POST", "/api/replicate", data);
      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Show success toast and state
      toast({
        title: "Replication request saved",
        description: "Your replication request has been saved. Now generating the Polkadot proxy call...",
      });
      
      // Process the Polkadot proxy call
      setIsProcessing(true);
      try {
        const proxyResult = await createProxyCall(variables.account, variables.pureProxyAccount);
        
        if (proxyResult.success) {
          setProxyCallData(proxyResult.data);
          toast({
            title: "Proxy call generated",
            description: "Your proxy call has been successfully generated.",
          });
        } else {
          toast({
            title: "Proxy Call Error",
            description: proxyResult.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Proxy Call Error",
          description: error instanceof Error ? error.message : "Error generating the proxy call",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setShowSuccess(true);
        
        // Hide success message after 15 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 15000);
      }
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
    setProxyCallData(null);
    mutation.mutate(data);
  };

  // Handle reset of the form and state
  const handleReset = () => {
    form.reset();
    setShowSuccess(false);
    setProxyCallData(null);
  };

  return (
    <Card className="w-full max-w-2xl bg-white rounded-lg shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Proxy Account Replication Tool</h1>
          <p className="text-gray-500 text-sm mt-1">Enter account details to generate a proxy call</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Your Account <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 5EjdajLJp5CKhGVaWV21wiyGxUw42rhCqGN32LuVH4wrqXTN"
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
                      placeholder="e.g. D9o7gYB92kXgr1UTjYWLDwXK5BeJdxR2irjwaoDEhJnNCfp"
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={mutation.isPending || isProcessing}
              >
                {(mutation.isPending || isProcessing) ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : "Generate Proxy Call"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>

        {/* Success message and proxy call data */}
        {showSuccess && (
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md" role="alert">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <p>Proxy call generated successfully!</p>
              </div>
            </div>
            
            {proxyCallData && (
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800">Proxy Call Details</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Proxy Definition Key</label>
                  <Textarea 
                    readOnly 
                    value={proxyCallData.proxyDefinitionKey || ""}
                    className="h-12 font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Proof Block</label>
                  <Input readOnly value={proxyCallData.proofBlock || ""} className="font-mono text-sm" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Method Hex</label>
                  <Textarea 
                    readOnly 
                    value={proxyCallData.method || ""}
                    className="h-16 font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Proxy Call (Hex)</label>
                  <Textarea 
                    readOnly 
                    value={proxyCallData.proxyCall || ""}
                    className="h-32 font-mono text-sm"
                  />
                </div>
              </div>
            )}
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
