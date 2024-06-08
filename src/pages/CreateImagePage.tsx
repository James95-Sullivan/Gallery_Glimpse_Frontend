import { DropZone } from "@/components/Dropzone";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { categories } from "@/lib/data";
import { toast } from "react-toastify";

import {useNavigate} from "react-router-dom";

import { useEffect, useState } from "react";

import { useUploadImageMutation } from "@/app/slices/imageApiSlice";
import { useAppSelector } from "@/app/hooks";
import { Checkbox } from "@/components/ui/checkbox";

export const CreateImagePage = () => {
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const navigate = useNavigate(); 

  const [img, setImg] = useState<File | null>(null);
  const [uploadImage] = useUploadImageMutation(userInfo.data.user._id);

  const formSchema = z.object({
    image: z.instanceof(File, { message: "Image is required" }).optional(),
    title: z.string().min(2, { message: "Title must be more than 2 characters" }),
    description: z.string().min(6, { message: "Description must be at least 6 characters" }),
    categories: z.string(),
    isPublic: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categories: "",
      isPublic: true,
    },
  });

  useEffect(() => {
    if (img) {
      console.log("Image Added: " + img.name);
      form.setValue("image", img);
      toast.success("Image added successfully");
    }
  }, [img, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Submitted values: ", values);
    const formData = new FormData();
    if (!img) return toast.error("Image is required");

    if (img) {
      formData.append("image", img);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("categories", values.categories);
    }

    try {
      console.log("FormData: ", formData);
      const response = await uploadImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      navigate(`/pin/${response.data.pinImage._id}`);
    } catch (error: unknown) {
      // console.error(error.data.message);
      toast.error((error as { data?: { message?: string } })?.data?.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="font-quicksand text-2xl font-semibold mb-4">Create New</h1>
          <div className="flex items-center justify-center w-full h-36 dark:bg-slate-900 light:bg-slate-100">
            <DropZone setImg={setImg} />
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input id="title" placeholder="Title" {...field} required autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Input
                      id="description"
                      placeholder="Description"
                      {...field}
                      required
                      autoComplete="description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="categories">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select A Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make Post Public</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button className="w-full mt-4 active:opacity-90 transition-opacity" type="submit">
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};
