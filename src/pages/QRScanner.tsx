
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { distributionApi } from '../services/api';
import { toast } from 'sonner';
import { Check, ArrowDown } from 'lucide-react';

// Mock component for QR scanning
// In a real React Native app, we would use react-native-camera and react-native-qrcode-scanner
const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [medicationReceived, setMedicationReceived] = useState(false);
  const [diapersReceived, setDiapersReceived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userId } = useAuth();
  const navigate = useNavigate();

  // Mock function to simulate scanning
  // In a real app, this would use the camera and QR code scanner
  const handleScan = async (data: string) => {
    setScanning(false);
    
    try {
      // Simulate getting a beneficiary by ID from the QR code
      const beneficiaryData = await distributionApi.getBeneficiary(data);
      setBeneficiary(beneficiaryData);
    } catch (error) {
      toast.error('فشل العثور على المستفيد');
      console.error(error);
      // Reset scanning
      setScanning(true);
    }
  };

  const handleConfirmMeal = async () => {
    if (!beneficiary) return;
    
    try {
      await distributionApi.confirmMeal(beneficiary.id);
      toast.success('تم تأكيد وجبة الطعام بنجاح');
    } catch (error) {
      toast.error('فشل تأكيد وجبة الطعام');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!beneficiary || !userId) return;
    
    setIsSubmitting(true);
    
    try {
      await distributionApi.registerDistribution({
        beneficiaryId: beneficiary.id,
        userId,
        medicationReceived,
        diapersReceived
      });
      
      toast.success('تم تسجيل التوزيع بنجاح');
      navigate('/home');
    } catch (error) {
      toast.error('فشل تسجيل التوزيع');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demo purposes, let's simulate scanning a QR code on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate scanning a QR code with ID "12345"
      handleScan("12345");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">
          مسح رمز الاستجابة السريعة
        </h1>
        
        {scanning ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-lg text-gray-500">
                جارٍ مسح رمز الاستجابة السريعة...
                <div className="mt-4 animate-bounce">
                  <ArrowDown className="h-8 w-8 mx-auto text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ) : beneficiary ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات المستفيد</CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`w-4 h-4 rounded-full bg-${beneficiary.colorCode || 'gray'}-500`}></div>
                  <p><strong>الاسم:</strong> {beneficiary.name || 'غير متوفر'}</p>
                </div>
                <p><strong>رقم الهوية:</strong> {beneficiary.cne || 'غير متوفر'}</p>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-bold mb-2">تأكيد التوزيع:</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleConfirmMeal}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-5 w-5" />
                      تأكيد وجبة الطعام
                    </Button>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={medicationReceived}
                          onChange={() => setMedicationReceived(!medicationReceived)}
                          className="mr-2 h-5 w-5"
                        />
                        <span>دواء</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={diapersReceived}
                          onChange={() => setDiapersReceived(!diapersReceived)}
                          className="mr-2 h-5 w-5"
                        />
                        <span>حفاضات</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري التحميل...' : 'تأكيد التوزيع'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center">
            <p className="text-red-500">فشل العثور على المستفيد</p>
            <Button onClick={() => setScanning(true)} className="mt-4">
              حاول مرة أخرى
            </Button>
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            onClick={() => navigate('/home')}
            variant="outline"
            className="w-full"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
