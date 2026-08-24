"use client";
import { Headphones, CreditCard, BookOpen, Smile } from "lucide-react";

const trustFeatures = [
  {
    title: "Always Available Support",
    description: "Get help anytime with our 24/7 support team. We're here to provide ongoing, top-notch assistance to ensure you're completely happy.",
    icon: <Headphones className="w-5 h-5 text-blue-600" />,
    color: "bg-blue-50"
  },
  {
    title: "Flexible Subscriptions",
    description: "Choose a plan that works for you. You can upgrade or cancel your subscription at any time without any constraints. Pay only for what you need.",
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    color: "bg-indigo-50"
  },
  {
    title: "Guides and Community",
    description: "Access a wide range of guides and tutorials for all your content generation needs. Become part of a supportive community here.",
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Not sure?",
    description: "Use our plus plan to easily automate your content creation process and see the magic happen instantly.",
    icon: <Smile className="w-5 h-5 text-blue-400" />,
    color: "bg-blue-50"
  }
];

export const TrustFeatures = () => {
  return (
    <div className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {trustFeatures?.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex gap-6 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-500 group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-950 dark:text-white mb-3 tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                  {feature.title === "Guides and Community" && (
                    <span className="text-[#2D46FF] dark:text-blue-400 cursor-pointer hover:underline ml-1">supportive community here.</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
