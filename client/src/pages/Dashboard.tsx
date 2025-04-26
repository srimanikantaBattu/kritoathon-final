import React, { useState } from "react";
import { Globe, Factory, ShieldCheck, PackageCheck, ArrowRight, Rocket, 
  BarChart3, PieChart, Users, Briefcase, TrendingUp, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HomePage() {
  // Market trend data for visualization
  const marketTrendData = [
    { month: 'Jan', domestic: 6500, international: 5400, projected: 6000 },
    { month: 'Feb', domestic: 7000, international: 5600, projected: 6200 },
    { month: 'Mar', domestic: 6800, international: 5900, projected: 6300 },
    { month: 'Apr', domestic: 7200, international: 6100, projected: 6500 },
    { month: 'May', domestic: 7500, international: 6400, projected: 6700 },
    { month: 'Jun', domestic: 7800, international: 6800, projected: 7000 },
    { month: 'Jul', domestic: 8200, international: 7100, projected: 7300 },
    { month: 'Aug', domestic: 8600, international: 7500, projected: 7600 },
  ];
  
  const stats = [
    { value: "₹4.2T", label: "Annual Transaction Volume", icon: <BarChart3 className="w-5 h-5" /> },
    { value: "8,600+", label: "Verified Manufacturers", icon: <Factory className="w-5 h-5" /> },
    { value: "43%", label: "Cost Reduction Average", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "120+", label: "Countries Served", icon: <Globe className="w-5 h-5" /> }
  ];

  const categories = [
    { name: "Electronics & Components", count: 1245, growth: "+18%" },
    { name: "Textiles & Apparel", count: 982, growth: "+12%" },
    { name: "Industrial Machinery", count: 876, growth: "+24%" },
    { name: "Pharmaceuticals", count: 754, growth: "+31%" },
    { name: "Automotive Parts", count: 698, growth: "+15%" },
    { name: "Consumer Goods", count: 645, growth: "+9%" }
  ];

  const insights = [
    {
      title: "Supply Chain Transparency",
      description: "Real-time visibility into every stage of your supply chain with blockchain verification",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />
    },
    {
      title: "Predictive Analytics",
      description: "AI-powered forecasting to anticipate market shifts and optimize inventory levels",
      icon: <TrendingUp className="w-8 h-8 text-blue-400" />
    },
    {
      title: "ESG Compliance Tracking",
      description: "Monitor environmental, social, and governance metrics across your supplier network",
      icon: <Globe className="w-8 h-8 text-purple-400" />
    },
    {
      title: "Quality Assurance Protocol",
      description: "Standardized inspection processes with digital certification and verification",
      icon: <PackageCheck className="w-8 h-8 text-amber-400" />
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-800 text-zinc-100">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-blue-900/10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4 border-amber-500/30 bg-amber-900/20 text-amber-400">
                Industry 4.0 Procurement
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-6">
                Data-Driven <span className="text-amber-400">Supply Chain</span> Intelligence
              </h1>
              <p className="text-xl text-zinc-300 mb-10 max-w-3xl mx-auto">
                Transform your sourcing strategy with AI-powered insights, verified suppliers, and real-time market analytics.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <Input 
                placeholder="Search products, suppliers, or markets..." 
                className="bg-zinc-800 border-zinc-700 focus:border-amber-500 text-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="bg-amber-600 hover:bg-amber-700 text-zinc-100">
                Find Suppliers <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="container mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Card className="bg-zinc-800/50 border-zinc-700/50 hover:shadow-amber-500/10 hover:border-amber-500/30 transition-all shadow-lg">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-zinc-700/50 text-amber-400">
                      {stat.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-zinc-100">{stat.value}</h3>
                      <p className="text-zinc-400">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Market Trends Visualization */}
      <section className="py-16 bg-zinc-900/60">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-2 border-blue-500/30 bg-blue-900/20 text-blue-400">
                Market Intelligence
              </Badge>
              <h2 className="text-3xl font-bold text-zinc-100 mb-4">Sourcing Market Trends</h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                Real-time insights into manufacturing volumes and pricing trends across key markets
              </p>
            </div>
            
            <Card className="bg-zinc-800/50 border-zinc-700/50 shadow-lg p-2">
              <CardContent className="p-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={marketTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#374151', borderColor: '#4B5563', color: '#F3F4F6' }}
                        itemStyle={{ color: '#F3F4F6' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="domestic" 
                        name="Domestic Production (₹ Millions)" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="international" 
                        name="International Imports (₹ Millions)" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        name="Projected Demand (₹ Millions)" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-800/30">
                    <p className="font-medium text-amber-400">+26% YoY Growth</p>
                    <p className="text-sm text-zinc-400">Domestic Manufacturing</p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-800/30">
                    <p className="font-medium text-blue-400">-8% Import Costs</p>
                    <p className="text-sm text-zinc-400">Last Quarter</p>
                  </div>
                  <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-800/30">
                    <p className="font-medium text-emerald-400">+18% Demand Forecast</p>
                    <p className="text-sm text-zinc-400">Next 6 Months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-2 border-purple-500/30 bg-purple-900/20 text-purple-400">
                Industry Insights
              </Badge>
              <h2 className="text-3xl font-bold text-zinc-100 mb-4">Top Sourcing Categories</h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                Explore high-demand manufacturing sectors with verified suppliers and pricing analytics
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-purple-500/30 transition-all shadow-lg h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-zinc-100">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400 text-sm">Active Suppliers</span>
                        <Badge variant="outline" className="bg-zinc-700/50 border-zinc-600">{category.count}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Annual Growth</span>
                        <Badge className="bg-emerald-900/20 text-emerald-400 border-emerald-800/30">{category.growth}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t border-zinc-700/50">
                      <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 w-full">
                        Explore Suppliers <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}