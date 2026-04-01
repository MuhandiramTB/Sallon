import { Link } from 'react-router-dom';
import Card from '../../ui/Card.jsx';

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/categories">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-700">Categories</h3>
            <p className="text-gray-500 text-sm mt-1">Manage service categories</p>
          </Card>
        </Link>
        <Link to="/admin/services">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-700">Services</h3>
            <p className="text-gray-500 text-sm mt-1">Manage salon services</p>
          </Card>
        </Link>
        <Link to="/admin/bookings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-700">Bookings</h3>
            <p className="text-gray-500 text-sm mt-1">View and manage bookings</p>
          </Card>
        </Link>
        <Link to="/admin/operating-hours">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-700">Operating Hours</h3>
            <p className="text-gray-500 text-sm mt-1">Set open/close times per day</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
