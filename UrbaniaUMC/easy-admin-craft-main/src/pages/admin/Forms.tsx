
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Edit, Trash2, FileText, Eye, Download, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

// Sample forms data based on the flowchart
const formsData = [
  { 
    id: 1, 
    title: "Gym Membership Registration", 
    category: "Membership",
    fields: 11,
    submissions: 152,
    lastUpdated: "2023-10-15"
  },
  { 
    id: 2, 
    title: "General Membership Registration", 
    category: "Membership",
    fields: 8,
    submissions: 254,
    lastUpdated: "2023-09-28"
  },
  { 
    id: 3, 
    title: "Volunteer Registration", 
    category: "Volunteering",
    fields: 12,
    submissions: 87,
    lastUpdated: "2023-11-01"
  },
  { 
    id: 4, 
    title: "Volunteer Hours Log", 
    category: "Volunteering",
    fields: 9,
    submissions: 123,
    lastUpdated: "2023-10-22"
  },
  { 
    id: 5, 
    title: "Event Registration", 
    category: "Events",
    fields: 6,
    submissions: 215,
    lastUpdated: "2023-10-30"
  },
  { 
    id: 6, 
    title: "Contact Us", 
    category: "Communication",
    fields: 4,
    submissions: 95,
    lastUpdated: "2023-11-05"
  },
];

const FormsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = formsData.filter(form => 
    searchQuery === "" || 
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    form.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddForm = () => {
    toast.success("Form builder would open here");
  };

  const handleEditForm = (formId: number) => {
    toast.info(`Edit form with ID: ${formId}`);
  };

  const handleDeleteForm = (formId: number) => {
    toast.success(`Form with ID: ${formId} has been deleted`);
  };

  const handleViewSubmissions = (formId: number) => {
    toast.info(`View submissions for form ID: ${formId}`);
  };

  const handleExportSubmissions = (formId: number) => {
    toast.success(`Exporting submissions for form ID: ${formId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight animate-slide-in">Forms Management</h2>
        <p className="text-muted-foreground animate-slide-in" style={{ animationDelay: "50ms" }}>
          Create, edit, and manage forms and view submissions.
        </p>
      </div>

      <Card className="animate-slide-in" style={{ animationDelay: "100ms" }}>
        <CardHeader className="px-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Forms</CardTitle>
              <CardDescription>Manage your form templates and submissions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAddForm}>
                <FilePlus2 className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-12 px-4 text-left font-medium">Form Name</th>
                    <th className="h-12 px-4 text-left font-medium">Category</th>
                    <th className="h-12 px-4 text-left font-medium">Fields</th>
                    <th className="h-12 px-4 text-left font-medium">Submissions</th>
                    <th className="h-12 px-4 text-left font-medium">Last Updated</th>
                    <th className="h-12 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                      <tr key={form.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{form.title}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.category === "Membership" ? "bg-blue-100 text-blue-800" :
                            form.category === "Volunteering" ? "bg-green-100 text-green-800" :
                            form.category === "Events" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {form.category}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{form.fields}</td>
                        <td className="p-4 align-middle">{form.submissions}</td>
                        <td className="p-4 align-middle">{form.lastUpdated}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewSubmissions(form.id)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleExportSubmissions(form.id)}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Export</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditForm(form.id)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteForm(form.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        No forms found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormsPage;
