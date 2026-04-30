import React from "react";
import { ToolCategory } from "@/utility/enums/tool-category";

export class Tool {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public icon: React.ElementType,
    public route: string,
    public category: ToolCategory,
    public keywords: string[] = []
  ) {}

  get metaTitle() {
    return `${this.name} | DevHub`;
  }

  get metaDescription() {
    return this.description;
  }
}
