import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ExternalLink, BookOpen } from "lucide-react";

export default function GuidancePage() {
  const backend = useBackend();
  const [activeTab, setActiveTab] = useState("personalized");

  const { data: personalizedData, isLoading: personalizedLoading } = useQuery({
    queryKey: ["guidance", "personalized"],
    queryFn: async () => await backend.guidance.personalized(),
  });

  const { data: allGuidanceData, isLoading: allGuidanceLoading } = useQuery({
    queryKey: ["guidance", "all"],
    queryFn: async () => await backend.guidance.list({}),
  });

  const personalizedResources = personalizedData?.resources || [];
  const allResources = allGuidanceData?.resources || [];

  const categorizeResources = (resources: any[]) => {
    const categories: Record<string, any[]> = {};
    resources.forEach((resource) => {
      if (!categories[resource.category]) {
        categories[resource.category] = [];
      }
      categories[resource.category].push(resource);
    });
    return categories;
  };

  const isLoading = personalizedLoading || allGuidanceLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-300">Loading guidance...</p>
          </div>
        </div>
      </div>
    );
  }

  const personalizedCategories = categorizeResources(personalizedResources);
  const allCategories = categorizeResources(allResources);

  const ResourceCard = ({ resource }: { resource: any }) => (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex-1">{resource.title}</h3>
        <Badge variant="secondary" className="ml-2">
          {resource.category.replace("_", " ")}
        </Badge>
      </div>
      {resource.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">{resource.description}</p>
      )}
      {resource.resourceUrl && (
        <Button variant="link" className="p-0 h-auto" asChild>
          <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer">
            Learn More <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </Button>
      )}
    </Card>
  );

  const CategorySection = ({ category, resources }: { category: string; resources: any[] }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 capitalize">{category.replace("_", " ")}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guidance & Resources</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access helpful resources and personalized guidance for navigating Medicaid coverage
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="personalized">Personalized for You</TabsTrigger>
            <TabsTrigger value="all">All Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="personalized">
            {personalizedResources.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Complete an Assessment First</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete a health assessment to receive personalized guidance recommendations
                </p>
              </Card>
            ) : (
              <div>
                {Object.entries(personalizedCategories).map(([category, resources]) => (
                  <CategorySection key={category} category={category} resources={resources} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div>
              {Object.entries(allCategories).map(([category, resources]) => (
                <CategorySection key={category} category={category} resources={resources} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
