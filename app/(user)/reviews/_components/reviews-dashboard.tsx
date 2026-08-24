'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Share2, Mail, Plus, Loader2, AlertCircle, LucideIcon, Settings2, Sparkles, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ReviewRequestForm } from './review-request-form';
import { ReviewResponseGenerator } from './review-response-generator';
import { ReviewToPostConverter } from './review-to-post-converter';
import { useReviews, useReviewRequest, useGenerateReviewResponse, useConvertReviewToPost, useSendFollowUp, useSendReviewResponseEmail } from '@/hooks/api-hooks';
import { useEffect } from 'react';
import { updateReviewSettings, getReviewSettings } from '../actions';
import { toast } from 'sonner';

interface Review {
   id: string;
   rating: number;
   reviewText: string | null;
   reviewerName: string;
   source: 'GOOGLE' | 'YELP' | 'FACEBOOK' | 'TRIPADVISOR' | 'DIRECT' | 'OTHER';
   reviewDate: string;
   responseText: string | null;
   sentiment: string;
   convertedToPost: boolean;
}

interface ReviewRequest {
   id: string;
   customerName: string;
   customerEmail: string;
   status: 'PENDING' | 'SENT' | 'DELIVERED' | 'SUBMITTED' | 'FAILED';
   sentAt: string;
}

interface ReviewStats {
   total: number;
   averageRating: number;
   pendingResponses: number;
   convertibleReviews: number;
   pendingRequests: number;
}

interface BusinessData {
   businessId?: string;
   creatorId?: string;
   business?: {
      id: string;
      name: string;
      [key: string]: unknown;
   };
   error?: string;
}

export function ReviewsDashboard({ businessData }: { businessData: BusinessData }) {
   const [selectedReview, setSelectedReview] = useState<Review | null>(null);
   const [activeTab, setActiveTab] = useState('all');
   const [showRequestModal, setShowRequestModal] = useState(false);
   const [showResponseModal, setShowResponseModal] = useState(false);
   const [showPostConverter, setShowPostConverter] = useState(false);
   const [autoRequestEnabled, setAutoRequestEnabled] = useState(false);
   const [isSettingsLoading, setIsSettingsLoading] = useState(false);

   // Fetch settings on mount
   useEffect(() => {
      if (businessData.businessId) {
         getReviewSettings(businessData.businessId).then(settings => {
            setAutoRequestEnabled(settings.autoRequestReviews);
         }).catch(err => {
            console.error('Failed to fetch review settings:', err);
         });
      }
   }, [businessData.businessId]);

   const handleToggleAutoRequest = async (checked: boolean) => {
      if (!businessData.businessId) return;

      const previousValue = autoRequestEnabled;
      setAutoRequestEnabled(checked);
      setIsSettingsLoading(true);

      try {
         await updateReviewSettings(businessData.businessId, checked);
         toast.success(checked ? 'Automated review requests enabled' : 'Automated review requests disabled');
      } catch (error) {
         setAutoRequestEnabled(previousValue);
         toast.error('Failed to update review settings');
      } finally {
         setIsSettingsLoading(false);
      }
   };

   // Get current user and business from props
   const { businessId } = businessData;

   // Fetch reviews using React Query
   const {
      data: reviewsData,
      isLoading,
      error,
      refetch
   } = useReviews(businessId || '', activeTab === 'all' ? undefined : activeTab);

   const reviews: Review[] = reviewsData?.data?.reviews || [];
   const reviewRequests: ReviewRequest[] = reviewsData?.data?.requests || [];
   const stats: ReviewStats = reviewsData?.data?.stats || {
      total: 0,
      averageRating: 0,
      pendingResponses: 0,
      convertibleReviews: 0,
      pendingRequests: 0
   };

   // Mutations
   const requestMutation = useReviewRequest(businessId || '');
   const generateResponseMutation = useGenerateReviewResponse(businessId || '');
   const convertMutation = useConvertReviewToPost(businessId || '');
   const followUpMutation = useSendFollowUp(businessId || '');
   const sendEmailMutation = useSendReviewResponseEmail(businessId || '');

   const handleRequestReview = async (data: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      channel: 'EMAIL' | 'SMS';
      customMessage?: string;
   }) => {
      try {
         await requestMutation.mutateAsync(data);
         toast.success('Review request sent successfully!');
         setShowRequestModal(false);
      } catch (error) {
         console.error('Failed to send review request:', error);
         toast.error('Failed to send review request');
      }
   };

   const handleGenerateResponse = async (reviewId: string) => {
      try {
         const result = await generateResponseMutation.mutateAsync(reviewId);
         return result.data?.responseText; // Return generated response text
      } catch (error) {
         console.error('Failed to generate response:', error);
         toast.error('Failed to generate response');
      }
   };

   const handleSendOwnerResponse = async (reviewId: string) => {
      try {
         await sendEmailMutation.mutateAsync(reviewId);
         toast.success('Response sent to customer successfully!');
         setShowResponseModal(false);
      } catch (error) {
         console.error('Failed to send response email:', error);
         toast.error('Failed to send response email');
      }
   };

   const handleConvertToPost = async (reviewId: string) => {
      try {
         const result = await convertMutation.mutateAsync(reviewId);
         return result.data; // Return generated post data
      } catch (error) {
         console.error('Failed to convert review:', error);
         toast.error(error as string);
      }
   };

   const handleSendFollowUp = async (requestId: string) => {
      try {
         await followUpMutation.mutateAsync({ requestId });
         toast.success('Follow-up reminder sent!');
      } catch (error) {
         console.error('Failed to send follow-up:', error);
         toast.error('Failed to send follow-up');
      }
   };

   if (businessData.error || !businessId) {
      return (
         <div className="flex items-center justify-center h-96">
            <div className="text-center">
               <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
               <p className="text-lg font-medium">
                  {businessData.error || 'No business selected'}
               </p>
               <p className="text-sm text-slate-500">Please select a business to view reviews</p>
            </div>
         </div>
      );
   }

   // if (isLoading) {
   //    return (
   //       <div className="flex items-center justify-center h-96">
   //          <div className="text-center">
   //             <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
   //             <p className="text-lg font-medium">Loading reviews...</p>
   //          </div>
   //       </div>
   //    );
   // }

   if (error) {
      return (
         <div className="flex items-center justify-center h-96">
            <div className="text-center">
               <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
               <p className="text-lg font-medium">Failed to load reviews</p>
               <p className="text-sm text-slate-500">{(error as Error).message}</p>
               <Button onClick={() => refetch()} className="mt-4">
                  Retry
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto p-6 space-y-8">
         {/* Header */}
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
         >
            <div>
               <h1 className="text-3xl font-bold">Review Manager</h1>
               <p className="text-slate-500 mt-1">
                  Manage reviews, generate responses, and create social proof
               </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                        <Label htmlFor="auto-reviews" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Autopilot Requests</Label>
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">Auto-send after checkout</span>
                  </div>
                  <Switch
                     id="auto-reviews"
                     checked={autoRequestEnabled}
                     onCheckedChange={handleToggleAutoRequest}
                     disabled={isSettingsLoading}
                  />
               </div>
               <Button onClick={() => setShowRequestModal(true)} className="rounded-2xl h-11 px-6 bg-linear-to-br from-blue-600 to-indigo-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Review
               </Button>
            </div>
         </motion.div>

         {/* Stats Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
               title="Total Reviews"
               value={stats.total.toString()}
               icon={Star}
               description="All time"
            />
            <StatCard
               title="Average Rating"
               value={stats.averageRating.toFixed(1)}
               icon={Star}
               description="Out of 5 stars"
            />
            <StatCard
               title="Pending Responses"
               value={stats.pendingResponses.toString()}
               icon={MessageSquare}
               description="Need attention"
            />
            <StatCard
               title="Pending Requests"
               value={stats.pendingRequests.toString()}
               icon={Mail}
               description="Follow-up needed"
            />
         </div>

         {/* Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
               <TabsTrigger value="all">All Reviews</TabsTrigger>
               <TabsTrigger value="pending">Pending Response</TabsTrigger>
               <TabsTrigger value="convertible">Create Posts</TabsTrigger>
               <TabsTrigger value="requests">Sent Requests</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
               {activeTab === 'requests' ? (
                  <div className="space-y-4">
                     {reviewRequests.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                           <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                           <p className="text-slate-500">No review requests sent yet.</p>
                        </div>
                     ) : (
                        reviewRequests?.map((request) => (
                           <RequestListItem
                              key={request.id}
                              request={request}
                              onFollowUp={() => handleSendFollowUp(request.id)}
                              isFollowingUp={followUpMutation.isPending && followUpMutation.variables?.requestId === request.id}
                           />
                        ))
                     )}
                  </div>
               ) : reviews.length === 0 ? (
                  <Card>
                     <CardContent className="py-16">
                        <div className="text-center space-y-6">
                           <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                              <Star className="h-12 w-12 text-slate-400" />
                           </div>
                           <div>
                              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                 No reviews yet
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                 {activeTab === 'all' && (
                                    <>
                                       Start by requesting reviews from your customers.
                                       Use the &quot;Request Review&quot; button above to send personalized review requests via email or SMS.
                                    </>
                                 )}
                                 {activeTab === 'pending' && (
                                    <>
                                       Great! All your reviews have received responses.
                                       Keep up the excellent customer service.
                                    </>
                                 )}
                                 {activeTab === 'convertible' && (
                                    <>
                                       No 4+ star reviews available to convert yet.
                                       Focus on delivering exceptional service to generate more high-rated reviews.
                                    </>
                                 )}
                              </p>
                              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                 <Button
                                    onClick={() => setShowRequestModal(true)}
                                    className="w-full sm:w-auto"
                                 >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Request Your First Review
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ) : (
                  <div className="space-y-4">
                     {reviews?.map((review) => (
                        <ReviewCard
                           key={review.id}
                           review={review}
                           onRequest={() => setShowRequestModal(true)}
                           onRespond={() => {
                              setSelectedReview(review);
                              setShowResponseModal(true);
                           }}
                           onConvert={() => {
                              setSelectedReview(review);
                              setShowPostConverter(true);
                           }}
                        />
                     ))}
                  </div>
               )}
            </TabsContent>
         </Tabs>

         {/* Modals */}
         <AnimatePresence>
            {showRequestModal && (
               <ReviewRequestForm
                  onSubmit={handleRequestReview}
                  onClose={() => setShowRequestModal(false)}
                  isLoading={requestMutation.isPending}
               />
            )}

            {showResponseModal && selectedReview && (
               <ReviewResponseGenerator
                  review={selectedReview}
                  onGenerate={handleGenerateResponse}
                  onSendEmail={handleSendOwnerResponse}
                  onClose={() => {
                     setShowResponseModal(false);
                     setSelectedReview(null);
                  }}
                  isLoading={generateResponseMutation.isPending}
                  isSending={sendEmailMutation.isPending}
               />
            )}

            {showPostConverter && selectedReview && (
               <ReviewToPostConverter
                  review={selectedReview}
                  onGenerate={handleConvertToPost}
                  onClose={() => {
                     setShowPostConverter(false);
                     setSelectedReview(null);
                  }}
                  isLoading={convertMutation.isPending}
               />
            )}
         </AnimatePresence>
      </div>
   );
}

function StatCard({
   title,
   value,
   icon: Icon,
   description
}: {
   title: string;
   value: string | number;
   icon: LucideIcon;
   description: string;
}) {
   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-slate-600" />
         </CardHeader>
         <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-500">{description}</p>
         </CardContent>
      </Card>
   );
}

function ReviewCard({
   review,
   onRequest,
   onRespond,
   onConvert
}: {
   review: Review;
   onRequest: () => void;
   onRespond: () => void;
   onConvert: () => void;
}) {
   const getStarArray = (rating: number) => Array.from({ length: rating }, (_, i) => i + 1);

   const getSourceBadgeColor = (source: string) => {
      switch (source.toLowerCase()) {
         case 'google':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
         case 'facebook':
            return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200';
         case 'yelp':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
         default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
      }
   };

   return (
      <Card>
         <CardHeader>
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex">
                     {getStarArray(review.rating).map((star) => (
                        <Star
                           key={star}
                           className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                     ))}
                  </div>
                  <Badge className={getSourceBadgeColor(review.source)}>
                     {review.source}
                  </Badge>
               </div>
               <span className="text-sm text-slate-500">
                  {new Date(review.reviewDate).toLocaleDateString()}
               </span>
            </div>
            <div className="space-y-2 mt-4">
               <p className="font-medium">{review.reviewerName}</p>
               {review.reviewText && (
                  <p className="text-slate-700 dark:text-slate-300">
                     &ldquo;{review.reviewText}&rdquo;
                  </p>
               )}
            </div>
         </CardHeader>
         <CardContent>
            {review.responseText && (
               <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm font-medium mb-1">Owner Response:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                     {review.responseText}
                  </p>
               </div>
            )}

            <div className="flex gap-2">
               {!review.responseText && (
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
               <Button size="sm" variant="outline" onClick={onRequest}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Follow-up
               </Button>
            </div>
         </CardContent>
      </Card>
   );
}

function RequestListItem({
   request,
   onFollowUp,
   isFollowingUp
}: {
   request: ReviewRequest;
   onFollowUp: () => void;
   isFollowingUp: boolean;
}) {
   const getStatusConfig = (status: string) => {
      switch (status) {
         case 'SUBMITTED':
            return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle };
         case 'PENDING':
         case 'SENT':
         case 'DELIVERED':
            return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock };
         case 'FAILED':
            return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle };
         default:
            return { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200', icon: Mail };
      }
   };

   const statusConfig = getStatusConfig(request.status);
   const StatusIcon = statusConfig.icon;

   return (
      <Card className="hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
         <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`p-2 rounded-full ${statusConfig.color.split(' ')[0]} dark:${statusConfig.color.split(' ')[2]}`}>
                  <StatusIcon className={`h-5 w-5 ${statusConfig.color.split(' ')[1]} dark:${statusConfig.color.split(' ')[3]}`} />
               </div>
               <div>
                  <h4 className="font-semibold">{request.customerName}</h4>
                  <p className="text-sm text-slate-500">{request.customerEmail}</p>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-right">
                  <Badge variant="secondary" className={`mb-1 ${statusConfig.color}`}>
                     {request.status}
                  </Badge>
                  <p className="text-xs text-slate-500 block">
                     Sent: {new Date(request.sentAt).toLocaleDateString()}
                  </p>
               </div>

               {(request.status === 'PENDING' || request.status === 'DELIVERED' || request.status === 'SENT') && (
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={onFollowUp}
                     disabled={isFollowingUp}
                  >
                     {isFollowingUp ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                        <Mail className="h-4 w-4 mr-2" />
                     )}
                     Follow Up
                  </Button>
               )}
            </div>
         </CardContent>
      </Card>
   );
}

export default ReviewsDashboard;
