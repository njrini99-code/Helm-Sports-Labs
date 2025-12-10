import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Building2, GraduationCap, Users, Trophy, ExternalLink, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default async function CollegeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch college data
  const { data: college, error } = await supabase
    .from('colleges')
    .select(`
      *,
      commits:college_interest(count).eq('interest_level', 'committed')
    `)
    .eq('id', id)
    .single();

  if (error || !college) {
    notFound();
  }

  // Get commit count
  const commitCount = Array.isArray(college.commits) 
    ? college.commits.length 
    : (college.commits as any)?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="glassmorphism rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white/20 shadow-2xl">
              <AvatarImage src={college.logo_url || undefined} />
              <AvatarFallback className="text-3xl font-bold bg-emerald-500 text-white">
                {college.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                {college.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground flex-wrap">
                {college.division && (
                  <>
                    <Badge variant="secondary">{college.division}</Badge>
                    <span>•</span>
                  </>
                )}
                {college.conference && (
                  <>
                    <span>{college.conference}</span>
                    <span>•</span>
                  </>
                )}
                {college.city && college.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {college.city}, {college.state}
                  </span>
                )}
              </div>
              
              {college.stadium_name && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  {college.stadium_name}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                <Heart className="mr-2 h-4 w-4" />
                Express Interest
              </Button>
              {college.website_url && (
                <Button variant="outline" asChild>
                  <a href={college.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold">{college.division || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Division</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{commitCount}</p>
              <p className="text-xs text-muted-foreground">Commits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{college.conference || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Conference</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{college.state || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Location</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional sections can be added here */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {college.name} is a {college.division || 'college'} program located in {college.city && college.state ? `${college.city}, ${college.state}` : 'the United States'}.
                {college.conference && ` They compete in the ${college.conference}.`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {college.website_url && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={college.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Official Website
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Contact Coach
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

