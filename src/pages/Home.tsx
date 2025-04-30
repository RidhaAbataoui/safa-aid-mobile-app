
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { distributionApi } from '../services/api';
import { toast } from 'sonner';
import { Medication, Baby, Bandage, QrCode, LogOut } from 'lucide-react';

const Home = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const handleDistribution = async (type: 'medication' | 'diapers' | 'beneficiary') => {
    if (!userId) {
      toast.error('لم يتم تسجيل الدخول');
      return;
    }

    try {
      await distributionApi.registerManualDistribution(type, userId);
      let message = '';
      switch (type) {
        case 'medication':
          message = 'تم تسجيل توزيع الدواء بنجاح';
          break;
        case 'diapers':
          message = 'تم تسجيل توزيع الحفاضات بنجاح';
          break;
        case 'beneficiary':
          message = 'تم تسجيل المستفيد بنجاح';
          break;
      }
      toast.success(message);
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل التوزيع');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => logout()} className="text-gray-600">
            <LogOut className="h-5 w-5 mr-1" />
            خروج
          </Button>
          <h1 className="text-2xl font-bold text-primary">صفا للإغاثة</h1>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {/* Distribution Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <DistributionButton
              label="دواء"
              icon={<Medication className="h-10 w-10" />}
              color="bg-medication"
              onClick={() => handleDistribution('medication')}
            />
            <DistributionButton
              label="حفاضات"
              icon={<Baby className="h-10 w-10" />}
              color="bg-diapers"
              onClick={() => handleDistribution('diapers')}
            />
          </div>
          
          <DistributionButton
            label="مستفيد"
            icon={<Bandage className="h-10 w-10" />}
            color="bg-beneficiary"
            onClick={() => handleDistribution('beneficiary')}
            fullWidth={true}
          />

          {/* QR Scanner Button */}
          <Button 
            onClick={() => navigate('/scanner')}
            className="w-full h-16 bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 mt-6"
          >
            <QrCode className="h-6 w-6" />
            <span className="text-lg">مسح رمز الاستجابة السريعة</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface DistributionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  fullWidth?: boolean;
}

const DistributionButton = ({ label, icon, color, onClick, fullWidth }: DistributionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${color} ${
        fullWidth ? 'col-span-2' : ''
      } rounded-full p-6 flex flex-col items-center justify-center h-40 shadow-lg hover:opacity-90 transition-opacity`}
    >
      <span className="text-white text-5xl mb-2">+</span>
      <div className="text-white">{icon}</div>
      <span className="text-white font-bold mt-2 text-lg">{label}</span>
    </button>
  );
};

export default Home;
