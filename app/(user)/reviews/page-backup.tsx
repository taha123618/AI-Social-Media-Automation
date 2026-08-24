'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Share2, Mail, Phone, Plus, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewRequestForm } from './_components/review-request-form';
import { ReviewResponseGenerator } from './_components/review-response-generator';
import { ReviewToPostConverter } from './_components/review-to-post-converter';

interface Review {
   id: string;
   rating: number;
   reviewText: string | null;
   reviewerName: string;
   source: string;
   reviewDate: string;
   ownerResponse: string | null;
   sentiment: string;
   convertedToPost: boolean;
}

interface ReviewStats {
   total: number;
   averageRating: number;
   pendingResponses: number;
   convertibleReviews: number;
}

export function ReviewsDashboard() {
   const [reviews, setReviews] = useState<Review[]>([]);
   const [stats, setStats] = useState<ReviewStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [selectedReview, setSelectedReview] = useState<Review | null>(null);
   const [activeTab, setActiveTab] = useState('all');

   useEffect(() => {
      fetchReviews();
      fetchStats();
   }, []);

   const fetchReviews = async () => {
      try {
         // In production, call API endpoint
         // const response = await fetch('/api/reviews');
         // const data = await response.json();

         // Mock data for now
         setReviews([
            {
               id: '1',
               rating: 5,
               reviewText: 'Amazing service! Highly recommend this place.',
               reviewerName: 'John Doe',
               source: 'GOOGLE',
               reviewDate: new Date().toISOString(),
               ownerResponse: null,
               sentiment: 'VERY_POSITIVE',
               convertedToPost: false
            },
            {
               id: '2',
               rating: 4,
               reviewText: 'Great experience overall. Will come back again!',
               reviewerName: 'Sarah Smith',
               source: 'FACEBOOK',
               reviewDate: new Date().toISOString(),
               ownerResponse: 'Thank you for your kind words!',
               sentiment: 'POSITIVE',
               convertedToPost: false
            }
         ]);
      } catch (error) {
         console.error('Failed to fetch reviews:', error);
      } finally {
         setLoading(false);
      }
   };

   const fetchStats = async () => {
      try {
         // Mock stats
         setStats({
            total: 24,
            averageRating: 4.6,
            pendingResponses: 3,
            convertibleReviews: 8
         });
      } catch (error) {
         console.error('Failed to fetch stats:', error);
      }
   };

   const filteredReviews = activeTab === 'all'
      ? reviews
      : activeTab === 'pending'
         ? reviews.filter(r => !r.ownerResponse)
         : activeTab === 'convertible'
            ? reviews.filter(r => r.rating >= 4 && !r.convertedToPost)
            : reviews;

   return (
      <div className="container mx-auto p-6 space-y-6">
         {/* Header */}
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
         >
            <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                  Review Manager
               </h1>
               <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage reviews, generate responses, and create social proof
               </p>
            </div>
            <Button size="lg" onClick={() => setSelectedReview(null)}>
               <Plus className="h-5 w-5 mr-2" />
               Request Review
            </Button>
         </motion.div>

         {/* Stats Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
               title="Total Reviews"
               value={stats?.total || 0}
               icon={MessageSquare}
               description="All time reviews"
            />
            <StatCard
               title="Average Rating"
               value={stats?.averageRating.toFixed(1) || '0.0'}
               icon={Star}
               description="Out of 5 stars"
               color="yellow"
            />
            <StatCard
               title="Pending Responses"
               value={stats?.pendingResponses || 0}
               icon={AlertCircle}
               description="Need attention"
               color="red"
            />
            <StatCard
               title="Ready to Share"
               value={stats?.convertibleReviews || 0}
               icon={Share2}
               description="4-5 star reviews"
               color="green"
            />
         </div>

         {/* Main Content */}
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
               <TabsList>
                  <TabsTrigger value="all">All Reviews</TabsTrigger>
                  <TabsTrigger value="pending">Pending Response</TabsTrigger>
                  <TabsTrigger value="convertible">Create Posts</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-4">
               {loading ? (
                  <div className="flex items-center justify-center py-12">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
               ) : filteredReviews.length === 0 ? (
                  <Card>
                     <CardContent className="py-12 text-center text-slate-500">
                        No reviews found in this view
                     </CardContent>
                  </Card>
               ) : (
                  <div className="grid gap-4">
                     {filteredReviews.map((review) => (
                        <ReviewCard
                           key={review.id}
                           review={review}
                           onRespond={() => setSelectedReview(review)}
                           onConvert={() => setSelectedReview(review)}
                        />
                     ))}
                  </div>
               )}
            </TabsContent>
         </Tabs>

         {/* Modals */}
         {selectedReview && (
            <ReviewResponseGenerator
               review={selectedReview}
               onClose={() => setSelectedReview(null)}
            />
         )}
      </div>
   );
}

function StatCard({
   title,
   value,
   icon: Icon,
   description,
   color = 'blue'
}: {
   title: string;
   value: string | number;
   icon: React.ComponentType<{ className?: string }>;
   description: string;
   color?: string;
}) {
   const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      green: 'bg-green-500'
   };

   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={`${colors[color]} p-2 rounded-lg`}>
               <Icon className="h-4 w-4 text-white" />
            </div>
         </CardHeader>
         <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
         </CardContent>
      </Card>
   );
}

function ReviewCard({
   review,
   onRespond,
   onConvert
}: {
   review: Review;
   onRespond: () => void;
   onConvert: () => void;
}) {
   const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

   return (
      <Card>
         <CardHeader>
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex">
                     {stars.map((filled, i) => (
                        <Star
                           key={i}
                           className={`h-5 w-5 ${filled
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                              }`}
                        />
                     ))}
                  </div>
                  <Badge variant={review.source === 'GOOGLE' ? 'default' : 'secondary'}>
                     {review.source}
                  </Badge>
                  {review.convertedToPost && (
                     <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Shared
                     </Badge>
                  )}
               </div>
               <span className="text-sm text-slate-500">
                  {new Date(review.reviewDate).toLocaleDateString()}
               </span>
            </div>
            <CardTitle className="text-lg mt-2">{review.reviewerName}</CardTitle>
         </CardHeader>
         <CardContent>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
               {review.reviewText}
            </p>

            {review.ownerResponse && (
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold mb-1">Your Response:</p>
                  <p className="text-slate-600 dark:text-slate-400">
                     {review.ownerResponse}
                  </p>
               </div>
            )}

            <div className="flex gap-2">
               {!review.ownerResponse && (
                  <Button
                     size="sm"
                     onClick={onRespond}
                     variant="outline"
                  >
                     <MessageSquare className="h-4 w-4 mr-2" />
                     Generate Response
                  </Button>
               )}
               {review.rating >= 4 && !review.convertedToPost && (
                  <Button
                     size="sm"
                     onClick={onConvert}
                     variant="outline"
                  >
                     <Share2 className="h-4 w-4 mr-2" />
                     Create Social Post
                  </Button>
               )}
               <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Follow-up
               </Button>
            </div>
         </CardContent>
      </Card>
   );
}

export default ReviewsDashboard;
