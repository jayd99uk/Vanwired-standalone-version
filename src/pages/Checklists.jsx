
import React, { useState, useEffect } from "react";
import { Checklist } from "@/api/localStorageChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Zap, Home, Droplets, Palette, Plus, Clock, Trash2, Car, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const defaultCategoryConfig = {
  exterior: {
    icon: Home,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200"
  },
  underbody: {
    icon: Car,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-800",
    borderColor: "border-gray-200"
  },
  mechanical: {
    icon: Wrench,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    borderColor: "border-orange-200"
  },
  plumbing: {
    icon: Droplets,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-800",
    borderColor: "border-cyan-200"
  },
  electrical: {
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200"
  },
  insulation: {
    icon: Home,
    color: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-800",
    borderColor: "border-teal-200"
  },
  interior: {
    icon: Palette,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    borderColor: "border-purple-200"
  }
};

export default function Checklists() {
  const [checklists, setChecklists] = useState([]);
  const [activeCategory, setActiveCategory] = useState("exterior");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    estimated_time: "",
    category: "exterior"
  });

  useEffect(() => {
    loadChecklists();
  }, []);

  useEffect(() => {
    // Load custom categories from storage on mount
    const loadCustomCategories = async () => {
      const stored = await Checklist.getCustomCategories();
      setCustomCategories(stored);
    };
    loadCustomCategories();
  }, []);

  useEffect(() => {
    const allChecklistCategories = [...new Set(checklists.map(item => item.category))];
    const allCustomCategories = [...new Set([...customCategories, ...allChecklistCategories.filter(cat => !defaultCategoryConfig[cat])])];

    const currentAllCategories = [...Object.keys(defaultCategoryConfig), ...allCustomCategories];
    if (!currentAllCategories.includes(activeCategory) && currentAllCategories.length > 0) {
      setActiveCategory(currentAllCategories[0]);
    } else if (currentAllCategories.length === 0) {
      setActiveCategory("");
    }
  }, [checklists, activeCategory, customCategories]);

  const loadChecklists = async () => {
    const data = await Checklist.list();
    setChecklists(data);
  };

  const handleToggleComplete = async (item) => {
    await Checklist.update(item.id, { is_completed: !item.is_completed });
    loadChecklists();
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await Checklist.delete(taskId);
      loadChecklists();
    }
  };

  const handleDeleteCategory = async (category) => {
    const itemsInCategory = getCategoryItems(category);
    const confirmMessage = itemsInCategory.length > 0 
      ? `This will delete ${itemsInCategory.length} task(s) in the "${category.replace(/_/g, ' ')}" category. Are you sure?`
      : `Are you sure you want to delete the "${category.replace(/_/g, ' ')}" category?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    for (const item of itemsInCategory) {
      await Checklist.delete(item.id);
    }
    
    setCustomCategories(prevCategories => prevCategories.filter(cat => cat !== category));
    
    const remainingCategories = getAllCategories().filter(cat => cat !== category);
    if (remainingCategories.length > 0) {
      setActiveCategory(remainingCategories[0]);
    } else {
      setActiveCategory("");
    }
    loadChecklists();
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      alert("Please enter a category name");
      return;
    }

    const categoryKey = await Checklist.addCustomCategory(trimmedName);

    if (getAllCategories().includes(categoryKey)) {
      // Category was just added, update state
      setCustomCategories(prev => [...prev, categoryKey]);
    }

    setActiveCategory(categoryKey);
    setNewItem({ ...newItem, category: categoryKey });
    setShowAddCategory(false);
    setNewCategoryName("");
    setShowAddForm(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    await Checklist.create({
      ...newItem,
      category: activeCategory,
      is_completed: false
    });

    setNewItem({
      title: "",
      description: "",
      estimated_time: "",
      category: activeCategory
    });
    setShowAddForm(false);
    loadChecklists();
  };

  const getCategoryItems = (category) => {
    return checklists.filter(item => item.category === category);
  };

  const getAllCategories = () => {
    return [...Object.keys(defaultCategoryConfig), ...customCategories];
  };

  const getCategoryConfig = (category) => {
    if (defaultCategoryConfig[category]) {
      return defaultCategoryConfig[category];
    }
    return {
      icon: CheckSquare,
      color: "from-pink-500 to-purple-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-800",
      borderColor: "border-pink-200"
    };
  };

  const getCompletionStats = (category) => {
    const items = getCategoryItems(category);
    const completed = items.filter(item => item.is_completed).length;
    const total = items.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const isCustomCategory = (category) => {
    return !defaultCategoryConfig[category];
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Build Checklists
          </h1>
          <p className="text-xl text-cyan-300">
            Track your vanlife build progress across all major systems
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {getAllCategories().map((category) => {
            const stats = getCompletionStats(category);
            const config = getCategoryConfig(category);
            const IconComponent = config.icon;
            const isCustom = isCustomCategory(category);
            
            return (
              <div key={category} className="relative group">
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeCategory === category 
                      ? `${config.bgColor} ${config.textColor} ${config.borderColor} border-2 shadow-md` 
                      : 'bg-gray-900/50 text-gray-300 border-2 border-cyan-500/30 hover:bg-gray-800/50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary" className="ml-1 bg-gray-800 text-white border-gray-700">
                    {stats.completed}/{stats.total}
                  </Badge>
                </button>
                
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    title={`Delete ${category.replace(/_/g, ' ')} category`}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            );
          })}
          
          <Button
            onClick={() => setShowAddCategory(true)}
            variant="outline"
            className="px-4 py-3 rounded-xl border-2 border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        {showAddCategory && (
          <Card className="cyber-card border-green-500/40 mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name..."
                  className="flex-1 bg-gray-900/80 border-green-500/30 text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                  Add
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                }} className="bg-gray-900/50 border-gray-600 text-gray-200">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {getAllCategories().slice(0, 8).map((category) => {
            const stats = getCompletionStats(category);
            const config = getCategoryConfig(category);
            const IconComponent = config.icon;
            
            return (
              <Card 
                key={category}
                className={`cyber-card border-cyan-500/30 cursor-pointer transition-all duration-200 ${
                  activeCategory === category ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{stats.percentage}%</div>
                      <div className="text-xs text-gray-400">{stats.completed}/{stats.total}</div>
                    </div>
                  </div>
                  <CardTitle className="capitalize text-lg text-white">{category.replace(/_/g, ' ')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="cyber-card border-cyan-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl capitalize text-white">
                  {activeCategory ? React.createElement(getCategoryConfig(activeCategory).icon, { className: "w-6 h-6 text-cyan-400" }) : null}
                  {activeCategory ? activeCategory.replace(/_/g, ' ') : "No Category Selected"} Checklist
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    disabled={!activeCategory}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                  {activeCategory && isCustomCategory(activeCategory) && (
                    <Button
                      onClick={() => handleDeleteCategory(activeCategory)}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Category
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddForm && (
                  <Card className="border-2 border-green-500/40 bg-green-500/10">
                    <CardContent className="p-4">
                      <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title" className="text-gray-200">Task Title</Label>
                            <Input
                              id="title"
                              value={newItem.title}
                              onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                              placeholder="e.g., Install battery bank"
                              className="mt-1 bg-gray-900/80 border-green-500/30 text-white placeholder-gray-500"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="time" className="text-gray-200">Estimated Time</Label>
                            <Input
                              id="time"
                              value={newItem.estimated_time}
                              onChange={(e) => setNewItem({...newItem, estimated_time: e.target.value})}
                              placeholder="e.g., 2-3 hours"
                              className="mt-1 bg-gray-900/80 border-green-500/30 text-white placeholder-gray-500"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-gray-200">Description</Label>
                          <Textarea
                            id="description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                            placeholder="Detailed description of the task..."
                            className="mt-1 bg-gray-900/80 border-green-500/30 text-white placeholder-gray-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Add Task
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="bg-gray-900/50 border-gray-600 text-gray-200 hover:bg-gray-800/50">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {activeCategory && getCategoryItems(activeCategory).map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        item.is_completed 
                          ? 'bg-green-500/10 border-green-500/40' 
                          : 'bg-gray-900/50 border-cyan-500/30 hover:border-cyan-500/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={() => handleToggleComplete(item)}
                          className="mt-1 border-2 border-cyan-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:text-white data-[state=checked]:border-cyan-400"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold ${item.is_completed ? 'line-through text-gray-400' : 'text-white'}`}>
                              {item.title}
                            </h3>
                            {item.estimated_time && (
                              <Badge variant="outline" className="text-gray-300 border-gray-600">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.estimated_time}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className={`text-sm ${item.is_completed ? 'text-gray-500' : 'text-gray-300'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!activeCategory ? (
                    <div className="text-center py-12 text-gray-400">
                      <Plus className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg">No category selected or available</p>
                      <p className="text-sm">Add a new category to get started!</p>
                    </div>
                  ) : getCategoryItems(activeCategory).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg">No tasks yet for {activeCategory.replace(/_/g, ' ')}</p>
                      <p className="text-sm">Click "Add Task" to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="cyber-card border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAllCategories().map((category) => {
                    const stats = getCompletionStats(category);
                    const config = getCategoryConfig(category);
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium capitalize text-gray-200">{category.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-gray-400">{stats.completed}/{stats.total}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${stats.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {getAllCategories().length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">No categories to display progress.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
