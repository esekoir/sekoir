import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Users, MessageSquare, Coins } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Currency {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  type: string;
  icon_url: string | null;
  buy_price: number | null;
  sell_price: number | null;
  is_active: boolean;
  display_order: number;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  wilaya: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  currency_code: string;
  guest_name: string | null;
  is_guest: boolean;
  created_at: string;
  user_id: string | null;
}

export const AdminPanel = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name_ar: '',
    name_en: '',
    type: 'currency',
    icon_url: '',
    buy_price: '',
    sell_price: '',
    display_order: 0
  });

  useEffect(() => {
    fetchCurrencies();
    fetchProfiles();
    fetchComments();
  }, []);

  const fetchCurrencies = async () => {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (!error && data) {
      setCurrencies(data);
    }
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setProfiles(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!error && data) {
      setComments(data);
    }
  };

  const handleAddCurrency = async () => {
    const { error } = await supabase.from('currencies').insert({
      code: newCurrency.code.toUpperCase(),
      name_ar: newCurrency.name_ar,
      name_en: newCurrency.name_en,
      type: newCurrency.type,
      icon_url: newCurrency.icon_url || null,
      buy_price: newCurrency.buy_price ? parseFloat(newCurrency.buy_price) : null,
      sell_price: newCurrency.sell_price ? parseFloat(newCurrency.sell_price) : null,
      display_order: newCurrency.display_order
    });

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تمت إضافة العملة بنجاح' });
      setIsAddingCurrency(false);
      setNewCurrency({
        code: '', name_ar: '', name_en: '', type: 'currency',
        icon_url: '', buy_price: '', sell_price: '', display_order: 0
      });
      fetchCurrencies();
    }
  };

  const handleUpdateCurrency = async () => {
    if (!editingCurrency) return;

    const { error } = await supabase
      .from('currencies')
      .update({
        code: editingCurrency.code,
        name_ar: editingCurrency.name_ar,
        name_en: editingCurrency.name_en,
        type: editingCurrency.type,
        icon_url: editingCurrency.icon_url,
        buy_price: editingCurrency.buy_price,
        sell_price: editingCurrency.sell_price,
        is_active: editingCurrency.is_active,
        display_order: editingCurrency.display_order
      })
      .eq('id', editingCurrency.id);

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم تحديث العملة بنجاح' });
      setEditingCurrency(null);
      setIsEditDialogOpen(false);
      fetchCurrencies();
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    const { error } = await supabase.from('currencies').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم حذف العملة' });
      fetchCurrencies();
    }
  };

  const handleDeleteProfile = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم حذف المستخدم' });
      fetchProfiles();
    }
  };

  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم حذف التعليق' });
      fetchComments();
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Tabs defaultValue="currencies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="currencies" className="flex items-center gap-2 text-xs sm:text-sm">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">العملات</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">المستخدمين</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2 text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">التعليقات</span>
          </TabsTrigger>
        </TabsList>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">إدارة العملات</h3>
            <Dialog open={isAddingCurrency} onOpenChange={setIsAddingCurrency}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة عملة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الرمز</Label>
                      <Input
                        value={newCurrency.code}
                        onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                        placeholder="USD"
                      />
                    </div>
                    <div>
                      <Label>النوع</Label>
                      <Select
                        value={newCurrency.type}
                        onValueChange={(v) => setNewCurrency({ ...newCurrency, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="currency">عملة</SelectItem>
                          <SelectItem value="crypto">عملة رقمية</SelectItem>
                          <SelectItem value="gold">ذهب</SelectItem>
                          <SelectItem value="transfer">تحويل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>الاسم بالعربية</Label>
                    <Input
                      value={newCurrency.name_ar}
                      onChange={(e) => setNewCurrency({ ...newCurrency, name_ar: e.target.value })}
                      placeholder="الدولار الأمريكي"
                    />
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية</Label>
                    <Input
                      value={newCurrency.name_en}
                      onChange={(e) => setNewCurrency({ ...newCurrency, name_en: e.target.value })}
                      placeholder="US Dollar"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>سعر الشراء</Label>
                      <Input
                        type="number"
                        value={newCurrency.buy_price}
                        onChange={(e) => setNewCurrency({ ...newCurrency, buy_price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>سعر البيع</Label>
                      <Input
                        type="number"
                        value={newCurrency.sell_price}
                        onChange={(e) => setNewCurrency({ ...newCurrency, sell_price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>رابط الأيقونة</Label>
                    <Input
                      value={newCurrency.icon_url}
                      onChange={(e) => setNewCurrency({ ...newCurrency, icon_url: e.target.value })}
                      placeholder="/icons/usd.png"
                    />
                  </div>
                  <Button onClick={handleAddCurrency} className="w-full">
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرمز</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>شراء</TableHead>
                  <TableHead>بيع</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-mono text-xs">{currency.code}</TableCell>
                    <TableCell className="text-xs">{currency.name_ar}</TableCell>
                    <TableCell className="text-xs">{currency.buy_price?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-xs">{currency.sell_price?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={isEditDialogOpen && editingCurrency?.id === currency.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingCurrency(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingCurrency(currency);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md" dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تعديل العملة</DialogTitle>
                            </DialogHeader>
                            {editingCurrency && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>الرمز</Label>
                                    <Input
                                      value={editingCurrency.code}
                                      onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>النوع</Label>
                                    <Select
                                      value={editingCurrency.type}
                                      onValueChange={(v) => setEditingCurrency({ ...editingCurrency, type: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="currency">عملة</SelectItem>
                                        <SelectItem value="crypto">عملة رقمية</SelectItem>
                                        <SelectItem value="gold">ذهب</SelectItem>
                                        <SelectItem value="transfer">تحويل</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label>الاسم بالعربية</Label>
                                  <Input
                                    value={editingCurrency.name_ar}
                                    onChange={(e) => setEditingCurrency({ ...editingCurrency, name_ar: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>الاسم بالإنجليزية</Label>
                                  <Input
                                    value={editingCurrency.name_en}
                                    onChange={(e) => setEditingCurrency({ ...editingCurrency, name_en: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>سعر الشراء</Label>
                                    <Input
                                      type="number"
                                      value={editingCurrency.buy_price || ''}
                                      onChange={(e) => setEditingCurrency({ ...editingCurrency, buy_price: parseFloat(e.target.value) || null })}
                                    />
                                  </div>
                                  <div>
                                    <Label>سعر البيع</Label>
                                    <Input
                                      type="number"
                                      value={editingCurrency.sell_price || ''}
                                      onChange={(e) => setEditingCurrency({ ...editingCurrency, sell_price: parseFloat(e.target.value) || null })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleUpdateCurrency} className="w-full">
                                  حفظ التعديلات
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7"
                          onClick={() => handleDeleteCurrency(currency.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد عملات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <h3 className="text-lg font-semibold mb-4">إدارة المستخدمين</h3>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الولاية</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="flex items-center gap-2">
                      {profile.avatar_url && (
                        <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="text-xs">{profile.full_name || 'بدون اسم'}</span>
                    </TableCell>
                    <TableCell className="text-xs">@{profile.username || '-'}</TableCell>
                    <TableCell className="text-xs">{profile.wilaya || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() => handleDeleteProfile(profile.user_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {profiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      لا يوجد مستخدمين
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4">
          <h3 className="text-lg font-semibold mb-4">إدارة التعليقات</h3>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المحتوى</TableHead>
                  <TableHead>العملة</TableHead>
                  <TableHead>الكاتب</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-[150px] truncate text-xs">{comment.content}</TableCell>
                    <TableCell className="font-mono text-xs">{comment.currency_code}</TableCell>
                    <TableCell className="text-xs">
                      {comment.is_guest ? comment.guest_name : 'مستخدم'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {comments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      لا توجد تعليقات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
