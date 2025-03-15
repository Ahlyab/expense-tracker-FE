import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Car,
  Home,
  Film,
  ShoppingCart,
  Lightbulb,
  Stethoscope,
  FileText,
  Plus,
  X,
  Edit,
  Trash2,
  PieChart,
} from "lucide-react";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Categories with lucide icons and colors
  const categories = [
    {
      id: "Food",
      icon: <ShoppingBag size={20} />,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "Transportation",
      icon: <Car size={20} />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "Housing",
      icon: <Home size={20} />,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "Entertainment",
      icon: <Film size={20} />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "Shopping",
      icon: <ShoppingCart size={20} />,
      color: "bg-pink-100 text-pink-800",
    },
    {
      id: "Utilities",
      icon: <Lightbulb size={20} />,
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "Healthcare",
      icon: <Stethoscope size={20} />,
      color: "bg-red-100 text-red-800",
    },
    {
      id: "Other",
      icon: <FileText size={20} />,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  // Filter expenses by date range
  const filterExpenseByDate = (expense) => {
    if (dateRange === "all") return true;

    const expenseDate = new Date(expense.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateRange === "today") {
      return expenseDate.toDateString() === today.toDateString();
    } else if (dateRange === "thisWeek") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return expenseDate >= startOfWeek;
    } else if (dateRange === "thisMonth") {
      return (
        expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear()
      );
    }
    return true;
  };

  // Set today's date as default
  useEffect(() => {
    const today = new Date();
    setDate(today.toISOString().substr(0, 10));

    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error("Error loading expenses:", e);
      }
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Calculate total expenses
  const total = expenses
    .filter(
      (expense) =>
        filterExpenseByDate(expense) &&
        (filter === "all" || expense.category === filter)
    )
    .reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

  // Edit an expense
  const startEdit = (expense) => {
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setEditingId(expense.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add or update an expense
  const handleSaveExpense = (e) => {
    e.preventDefault();

    if (!description || !amount || !category || !date) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      // Update existing expense
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingId
            ? {
                ...expense,
                description,
                amount: parseFloat(amount),
                category,
                date,
              }
            : expense
        )
      );
      setEditingId(null);
    } else {
      // Add new expense
      const newExpense = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        category,
        date,
      };
      setExpenses([...expenses, newExpense]);
    }

    // Reset form fields
    setDescription("");
    setAmount("");
    setCategory("");

    // Set date to today
    const today = new Date();
    setDate(today.toISOString().substr(0, 10));

    // Close form on mobile
    setIsFormOpen(false);
  };

  // Delete an expense
  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((expense) => expense.id !== id));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    const today = new Date();
    setDate(today.toISOString().substr(0, 10));
    setEditingId(null);
    setIsFormOpen(false);
  };

  // Format amount as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get category color and icon
  const getCategoryInfo = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return (
      category || {
        icon: <FileText size={20} />,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Calculate category totals for the chart
  const categoryTotals = categories
    .map((category) => {
      const total = expenses
        .filter(
          (expense) =>
            expense.category === category.id && filterExpenseByDate(expense)
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { ...category, total };
    })
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total);

  // Get filtered and sorted expenses
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        (filter === "all" || expense.category === filter) &&
        filterExpenseByDate(expense)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Expense Tracker</h1>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="md:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full shadow transition duration-200 flex items-center"
        >
          {isFormOpen ? (
            <>
              <X size={18} className="mr-1" /> Close Form
            </>
          ) : (
            <>
              <Plus size={18} className="mr-1" /> Add Expense
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form and Summary */}
        <div className="lg:col-span-1">
          {/* Expense Form */}
          <div
            className={`bg-white rounded-xl shadow-md mb-6 overflow-hidden transition-all duration-300 ${
              isFormOpen
                ? "max-h-screen"
                : "max-h-0 md:max-h-screen hidden md:block"
            }`}
          >
            <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Expense" : "Add New Expense"}
              </h2>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="What did you spend on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="0.00"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-lg border flex items-center transition hover:bg-gray-50 ${
                        category === cat.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      <span className="text-sm">{cat.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition duration-200 flex items-center justify-center"
                >
                  {editingId ? (
                    <>Update Expense</>
                  ) : (
                    <>
                      <Plus size={18} className="mr-1" /> Add Expense
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <X size={18} className="mr-1" /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500">
              <h2 className="text-xl font-bold text-white">Summary</h2>
            </div>

            <div className="p-5">
              <div className="text-center mb-5">
                <p className="text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(total)}
                </p>
              </div>

              {categoryTotals.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <PieChart size={18} className="mr-1" /> Top Categories
                  </h3>
                  <div className="space-y-3">
                    {categoryTotals.slice(0, 3).map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{cat.icon}</span>
                          <span>{cat.id}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Expenses List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
              <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {filteredExpenses.length} items
              </span>
            </div>

            {filteredExpenses.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const { icon, color } = getCategoryInfo(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className="p-4 hover:bg-gray-50 transition duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              color.split(" ")[0]
                            }`}
                          >
                            {icon}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {expense.description}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{formatDate(expense.date)}</span>
                              <span className="mx-2">•</span>
                              <span
                                className={`${color} px-2 py-0.5 rounded-full text-xs`}
                              >
                                {expense.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">
                            {formatCurrency(expense.amount)}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => startEdit(expense)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <PieChart size={64} className="mx-auto text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No expenses found
                </h3>
                <p className="text-gray-500 mb-4">
                  Start tracking your expenses by adding your first expense.
                </p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center justify-center mx-auto"
                >
                  <Plus size={18} className="mr-1" /> Add Your First Expense
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
