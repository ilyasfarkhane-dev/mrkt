import React from 'react';
import { CircleUser } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";



const UserBadge = ({ project }: { project: any }) => {
  const categoryTitle = project.Category?.name || "Autre";
console.log("projet: ",project)
  return (
   
        <div className="flex items-center gap-3 cursor-pointer">
          <CircleUser className="text-gray-600" size={20} />
          <p className="text-gray-600 font-medium">
            {project.seller?.name || 'Unknown'}
          </p>
        </div>
   
  );
};

export default UserBadge;