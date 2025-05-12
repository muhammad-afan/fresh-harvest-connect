"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Building,
  Calendar,
  Camera,
  Facebook,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Twitter,
  Upload,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const farmingMethods = [
  { id: "organic", label: "Organic" },
  { id: "conventional", label: "Conventional" },
  { id: "hydroponic", label: "Hydroponic" },
  { id: "permaculture", label: "Permaculture" },
  { id: "biodynamic", label: "Biodynamic" },
  { id: "sustainable", label: "Sustainable" },
  { id: "other", label: "Other" },
];

const profileFormSchema = z.object({
  farmName: z
    .string()
    .min(2, { message: "Farm name must be at least 2 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  address: z.object({
    street: z.string().min(1, { message: "Street address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State/Province is required" }),
    zipCode: z.string().min(1, { message: "Zip/Postal code is required" }),
    country: z.string().min(1, { message: "Country is required" }),
  }),
  contactInfo: z.object({
    phone: z.string().min(1, { message: "Phone number is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    website: z
      .string()
      .url({ message: "Please enter a valid URL" })
      .optional()
      .or(z.literal("")),
  }),
  farmingMethods: z.array(z.string()),
  socialMedia: z.object({
    facebook: z
      .string()
      .url({ message: "Please enter a valid URL" })
      .optional()
      .or(z.literal("")),
    instagram: z
      .string()
      .url({ message: "Please enter a valid URL" })
      .optional()
      .or(z.literal("")),
    twitter: z
      .string()
      .url({ message: "Please enter a valid URL" })
      .optional()
      .or(z.literal("")),
    youtube: z
      .string()
      .url({ message: "Please enter a valid URL" })
      .optional()
      .or(z.literal("")),
  }),
  establishedYear: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const year = Number.parseInt(val);
        return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
      },
      { message: "Please enter a valid year between 1900 and current year" }
    )
    .optional()
    .or(z.literal("")),
  farmSize: z.string().optional(),
  gallery: z.array(z.string()),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FarmerProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      farmName: "",
      description: "",
      profileImage: "",
      coverImage: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      contactInfo: {
        phone: "",
        email: "",
        website: "",
      },
      farmingMethods: [],
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
      },
      establishedYear: "",
      farmSize: "",
      gallery: [],
    },
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user.role !== "FARMER") {
      router.push("/dashboard");
      return;
    }

    // Fetch existing profile if available
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/farmer/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            // Reset form with fetched data
            form.reset(data.profile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [status, session, router, form]);

  const handleImageUpload = (
    result: any,
    field: "profileImage" | "coverImage" | "gallery"
  ) => {
    if (result.event === "success") {
      if (field === "gallery") {
        const currentGallery = form.getValues("gallery");
        form.setValue("gallery", [...currentGallery, result.info.secure_url], {
          shouldValidate: true,
        });
      } else {
        form.setValue(field, result.info.secure_url, { shouldValidate: true });
      }
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = form.getValues("gallery");
    form.setValue(
      "gallery",
      currentGallery.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/farmer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save profile");
      }

      setSuccess("Profile saved successfully!");
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Preview Panel */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="relative p-0 h-32 overflow-hidden">
              {form.watch("coverImage") ? (
                <Image
                  src={form.watch("coverImage") || "/placeholder.svg"}
                  alt="Farm cover"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-green-400 to-teal-500" />
              )}
            </CardHeader>
            <CardContent className="pt-14 relative">
              <div className="absolute -top-10 left-4 rounded-full border-4 border-background">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={form.watch("profileImage") || "/placeholder.svg"}
                    alt={form.watch("farmName")}
                  />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {form.watch("farmName")?.charAt(0) || "F"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">
                  {form.watch("farmName") || "Your Farm Name"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {form.watch("description") ||
                    "Your farm description will appear here"}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {form.watch("farmingMethods").length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.watch("farmingMethods").map((method) => (
                      <Badge
                        key={method}
                        variant="outline"
                        className="bg-primary/10"
                      >
                        {method}
                      </Badge>
                    ))}
                  </div>
                )}

                {form.watch("address.city") && form.watch("address.state") && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {form.watch("address.city")}, {form.watch("address.state")}
                  </div>
                )}

                {form.watch("establishedYear") && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Est. {form.watch("establishedYear")}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                {form.watch("socialMedia.facebook") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={form.watch("socialMedia.facebook")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Facebook</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {form.watch("socialMedia.instagram") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={form.watch("socialMedia.instagram")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Instagram</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {form.watch("socialMedia.twitter") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={form.watch("socialMedia.twitter")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Twitter</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {form.watch("socialMedia.youtube") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={form.watch("socialMedia.youtube")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>YouTube</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardContent>
          </Card>

          {form.watch("gallery").length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farm Gallery</CardTitle>
                <CardDescription>
                  Preview of your farm gallery images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {form.watch("gallery").map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Farmer Profile
            </h1>
            <Button
              type="submit"
              form="profile-form"
              disabled={loading}
              className="gap-2"
              size="sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 text-green-700">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="social">Social & Contact</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                id="profile-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <div className="pr-4">
                    <TabsContent value="basic" className="space-y-6 mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                          <CardDescription>
                            Tell customers about your farm and what makes it
                            special
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="farmName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Farm Name*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Green Acres Farm"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="establishedYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year Established</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        placeholder={new Date()
                                          .getFullYear()
                                          .toString()}
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    When did your farm begin operations?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="farmSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Farm Size</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="e.g., 5 acres"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    The total area of your farm
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Farm Description*</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell customers about your farm, its history, and what makes your products special..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This description will appear on your public
                                  profile
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="farmingMethods"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>Farming Methods</FormLabel>
                                  <FormDescription>
                                    Select all the farming methods you practice
                                  </FormDescription>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {farmingMethods.map((method) => (
                                    <FormField
                                      key={method.id}
                                      control={form.control}
                                      name="farmingMethods"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={method.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(
                                                  method.label
                                                )}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([
                                                        ...field.value,
                                                        method.label,
                                                      ])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) =>
                                                            value !==
                                                            method.label
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                              {method.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6 mt-0 px-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile & Cover Images</CardTitle>
                          <CardDescription>
                            Upload images that represent you and your farm
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="profileImage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Profile Image*</FormLabel>
                                  <FormControl>
                                    <div className="space-y-4">
                                      {field.value ? (
                                        <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden border-4 border-muted">
                                          <Image
                                            src={
                                              field.value || "/placeholder.svg"
                                            }
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                                            onClick={() =>
                                              form.setValue("profileImage", "")
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-40 w-40 mx-auto rounded-full bg-muted">
                                          <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                                          <span className="text-xs text-muted-foreground">
                                            No image
                                          </span>
                                        </div>
                                      )}

                                      <CldUploadWidget
                                        uploadPreset="farmer-profiles"
                                        onUpload={(result) =>
                                          handleImageUpload(
                                            result,
                                            "profileImage"
                                          )
                                        }
                                      >
                                        {({ open }) => (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => open()}
                                            className="w-full"
                                          >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {field.value
                                              ? "Change Profile Image"
                                              : "Upload Profile Image"}
                                          </Button>
                                        )}
                                      </CldUploadWidget>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    This image will be used as your profile
                                    picture
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="coverImage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cover Image</FormLabel>
                                  <FormControl>
                                    <div className="space-y-4">
                                      {field.value ? (
                                        <div className="relative h-40 w-full rounded-md overflow-hidden">
                                          <Image
                                            src={
                                              field.value || "/placeholder.svg"
                                            }
                                            alt="Cover"
                                            fill
                                            className="object-cover"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                            onClick={() =>
                                              form.setValue("coverImage", "")
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-40 w-full rounded-md bg-muted">
                                          <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                                          <span className="text-xs text-muted-foreground">
                                            No cover image
                                          </span>
                                        </div>
                                      )}

                                      <CldUploadWidget
                                        uploadPreset="farmer-covers"
                                        onUpload={(result) =>
                                          handleImageUpload(
                                            result,
                                            "coverImage"
                                          )
                                        }
                                      >
                                        {({ open }) => (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => open()}
                                            className="w-full"
                                          >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {field.value
                                              ? "Change Cover Image"
                                              : "Upload Cover Image"}
                                          </Button>
                                        )}
                                      </CldUploadWidget>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    This image will appear at the top of your
                                    profile
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Farm Gallery</CardTitle>
                          <CardDescription>
                            Showcase your farm with additional photos
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={form.control}
                            name="gallery"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      {field.value.map((image, index) => (
                                        <div
                                          key={index}
                                          className="relative aspect-square rounded-md overflow-hidden border"
                                        >
                                          <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`Gallery ${index + 1}`}
                                            fill
                                            className="object-cover"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                            onClick={() =>
                                              handleRemoveGalleryImage(index)
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}

                                      <CldUploadWidget
                                        uploadPreset="farmer-gallery"
                                        onUpload={(result) =>
                                          handleImageUpload(result, "gallery")
                                        }
                                      >
                                        {({ open }) => (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => open()}
                                            className="h-full min-h-[120px] border-dashed"
                                          >
                                            <div className="flex flex-col items-center justify-center">
                                              <Plus className="h-8 w-8 mb-2" />
                                              <span>Add Image</span>
                                            </div>
                                          </Button>
                                        )}
                                      </CldUploadWidget>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Upload photos of your farm, products, or
                                  farming practices
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="location"
                      className="space-y-6 mt-0 px-1"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>Farm Address</CardTitle>
                          <CardDescription>
                            Where is your farm located?
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="address.street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="123 Farm Lane"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="address.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City*</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Farmington"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="address.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State/Province*</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="California"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="address.zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zip/Postal Code*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="12345" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="address.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country*</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="United States"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6 mt-0 px-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                          <CardDescription>
                            How can customers reach you?
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="contactInfo.phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone*</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="(555) 123-4567"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="contactInfo.email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email*</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="farm@example.com"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="contactInfo.website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="https://www.yourfarm.com"
                                      className="pl-10"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Your farm's website (if you have one)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Social Media</CardTitle>
                          <CardDescription>
                            Connect with customers on social platforms
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="socialMedia.facebook"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Facebook</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="https://facebook.com/yourfarm"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="socialMedia.instagram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="https://instagram.com/yourfarm"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="socialMedia.twitter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="https://twitter.com/yourfarm"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="socialMedia.youtube"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>YouTube</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="https://youtube.com/yourchannel"
                                        className="pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </form>
            </Form>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
