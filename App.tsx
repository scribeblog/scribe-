import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import BlogViewer from './components/BlogViewer';
import { fetchAvailableDates, fetchBlogByDate } from './services/blogService';
import { recordPageView, getTotalViews } from './services/analytics';
import { Blog } from './types';
import { BookOpen, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalViews, setTotalViews] = useState<number>(0);

  // Initial Data Fetch & Homepage Analytics
  useEffect(() => {
    const init = async () => {
      const dates = await fetchAvailableDates();
      setAvailableDates(dates);
      
      // Fetch total view count for footer
      const views = await getTotalViews();
      setTotalViews(views);

      // Record homepage visit
      recordPageView('/');
    };
    init();
  }, []);

  // Fetch Blog when date changes & Record Article View
  useEffect(() => {
    if (!selectedDate) return;

    const loadBlog = async () => {
      setLoading(true);
      
      // 1. Fetch content
      const blog = await fetchBlogByDate(selectedDate);
      setCurrentBlog(blog);
      
      // 2. Record analytics for this specific post
      recordPageView(`/post/${selectedDate}`);
      
      setLoading(false);
    };

    loadBlog();
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    if (selectedDate === date) return;
    setSelectedDate(date);
    // Scroll to blog view on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('blog-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLatestPost = async () => {
    const dates = await fetchAvailableDates();
    setAvailableDates(dates);
    
    if (dates.length > 0) {
      const latest = dates[dates.length - 1]; 
      handleDateSelect(latest);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-forestGreen bg-offWhite">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Left Column: Calendar & Actions */}
        <div className="w-full lg:w-auto lg:sticky lg:top-32 flex flex-col gap-8 items-center lg:items-start shrink-0">
          <Calendar 
            availableDates={availableDates} 
            selectedDate={selectedDate} 
            onSelectDate={handleDateSelect} 
          />
          
          <button 
            onClick={handleLatestPost}
            className="group flex items-center justify-center gap-2 w-full max-w-md bg-forestGreen text-offWhite py-4 px-6 rounded-none shadow-[4px_4px_0px_0px_#F4C95D] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#F4C95D] active:translate-y-[4px] active:shadow-none transition-all font-bold tracking-wide"
          >
            <BookOpen size={20} className="text-warmYellow group-hover:text-white transition-colors" />
            READ LATEST POST
          </button>
        </div>

        {/* Right Column: Blog Content */}
        <div id="blog-view" className="w-full lg:flex-1 min-w-0">
          <BlogViewer 
            blog={currentBlog} 
            loading={loading}
          />
        </div>

      </main>

      <footer className="w-full py-8 flex flex-col gap-2 items-center justify-center text-forestGreen/40 text-sm font-serif border-t border-forestGreen/10 mt-auto">
        <span>&copy; {new Date().getFullYear()} SCRIBE. All rights reserved.</span>
        
        {/* Analytics Counter */}
        <div className="flex items-center gap-2 text-xs opacity-60 bg-forestGreen/5 px-3 py-1 rounded-full">
          <Eye size={12} />
          <span>{totalViews.toLocaleString()} reads</span>
        </div>
      </footer>
    </div>
  );
};

export default App;