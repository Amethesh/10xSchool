"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Copy, Share2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

function CertificateContent() {
  const searchParams = useSearchParams();
  const rawName = searchParams.get("name");
  
  // Clean the name parameter by removing surrounding quotes and trimming
  const name = rawName?.replace(/^["']|["']$/g, '').trim();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!name) {
        setError("No name provided");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Search for files in the Certificates bucket that match the name
        // Look for exact matches first, then partial matches
        const { data, error: searchError } = await supabase
          .storage
          .from("Certificates")
          .list("", {
            limit: 100, // Get more results to find exact matches
          });

        if (searchError) {
          throw searchError;
        }

        if (!data || data.length === 0) {
          setError("No certificates found in storage");
          setLoading(false);
          return;
        }

        console.log("Available certificates:", data.map(f => f.name));
        console.log("Searching for:", name);

        // Find exact match first, then partial match
        let matchedFile = data.find(file => {
          const fileName = file.name.toLowerCase();
          const searchName = name.toLowerCase();
          
          // Remove file extension for comparison
          const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
          
          console.log(`Comparing "${fileName}" with "${searchName}"`);
          
          // Try multiple matching strategies
          const matches = (
            fileName.includes(searchName) ||
            fileNameWithoutExt.includes(searchName) ||
            searchName.includes(fileNameWithoutExt) ||
            // Handle underscore vs space variations
            fileName.replace(/_/g, ' ').includes(searchName.replace(/_/g, ' ')) ||
            fileNameWithoutExt.replace(/_/g, ' ').includes(searchName.replace(/_/g, ' ')) ||
            // Try fuzzy matching - allow for small differences
            fileNameWithoutExt.startsWith(searchName) ||
            searchName.startsWith(fileNameWithoutExt)
          );
          
          if (matches) {
            console.log(`Found match: ${fileName}`);
          }
          
          return matches;
        });

        if (!matchedFile) {
          // If no match found, show available certificates for debugging
          const availableNames = data.map(f => f.name.replace(/\.[^/.]+$/, "")).join(", ");
          setError(`No certificate found for "${name}". Available certificates: ${availableNames}`);
          setLoading(false);
          return;
        }

        const fileName = matchedFile.name;
        
        const { data: publicUrlData } = supabase
          .storage
          .from("Certificates")
          .getPublicUrl(fileName);

        setImageUrl(publicUrlData.publicUrl);
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError("Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [name]);

  const handleCopyUrl = async () => {
    if (imageUrl) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Page URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl || downloading) return;

    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract extension from url or default to png
      const extension = imageUrl.split('.').pop() || 'png';
      a.download = `Certificate-${name}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Certificate downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/20">
          <AlertCircle className="h-6 w-6" /> 
        </div>
        <h2 className="text-xl font-semibold text-foreground">Certificate Not Found</h2>
        <p className="max-w-md text-muted-foreground">{error || "We couldn't find a certificate for this name."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border bg-card shadow-xl md:rounded-2xl">
        {/* Image Container with Aspect Ratio fallback or auto height */}
        <div className="relative flex items-center justify-center bg-muted/50 p-4 md:p-8">
           <img 
            src={imageUrl} 
            alt={`Certificate for ${name}`}
            className="h-auto w-full rounded-lg shadow-sm"
          />
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <Button 
          onClick={handleDownload} 
          disabled={downloading}
          size="lg" 
          className="w-full gap-2 sm:w-auto font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Downloading..." : "Download Certificate"}
        </Button>
        <Button 
          onClick={handleCopyUrl} 
          variant="outline" 
          size="lg" 
          className="w-full gap-2 sm:w-auto shadow-sm hover:shadow-md transition-all"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20 px-4 py-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center md:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Course Certificate
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verify and download your achievement
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <CertificateContent />
        </Suspense>
      </div>
    </main>
  );
}
