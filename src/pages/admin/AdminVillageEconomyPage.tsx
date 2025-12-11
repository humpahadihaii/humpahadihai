import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, Star, Link2, Unlink, Search, Package, ShoppingBag, MapPin, Building, Wand2, Upload, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVillageLinks, useLinkableItems, ItemType, VillageLink } from "@/hooks/useVillageLinks";
import { VillageLinkSuggestions } from "@/components/admin/VillageLinkSuggestions";
import { VillageLinkBulkImport } from "@/components/admin/VillageLinkBulkImport";
import { VillageLinkAuditLog } from "@/components/admin/VillageLinkAuditLog";

const ITEM_TYPES: ItemType[] = ['provider', 'listing', 'package', 'product'];

const ITEM_TYPE_CONFIG = {
  provider: { label: 'Providers', icon: Building, color: 'bg-blue-500' },
  listing: { label: 'Listings', icon: MapPin, color: 'bg-green-500' },
  package: { label: 'Travel Packages', icon: Package, color: 'bg-purple-500' },
  product: { label: 'Shop Products', icon: ShoppingBag, color: 'bg-orange-500' }
};

type MainTab = 'items' | 'suggestions' | 'bulk-import' | 'audit';

export default function AdminVillageEconomyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [village, setVillage] = useState<any>(null);
  const [mainTab, setMainTab] = useState<MainTab>('items');
  const [activeTab, setActiveTab] = useState<ItemType>('provider');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { links, counts, isLoading, linkItem, unlinkItem, updateLink, getLinkedItems, refetch } = useVillageLinks(id);
  const { items: linkableItems, isLoading: itemsLoading } = useLinkableItems(activeTab, id);

  useEffect(() => {
    const fetchVillage = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('villages')
        .select('*')
        .eq('id', id)
        .single();
      setVillage(data);
    };
    fetchVillage();
  }, [id]);

  const handleLink = async (itemId: string) => {
    await linkItem(activeTab, itemId);
    setAddDialogOpen(false);
    refetch();
  };

  const handleUnlink = async (itemType: ItemType, itemId: string) => {
    if (confirm('Are you sure you want to unlink this item?')) {
      await unlinkItem(itemType, itemId);
    }
  };

  const handleTogglePromote = async (link: VillageLink) => {
    await updateLink(link.item_type as ItemType, link.item_id, { promote: !link.promote });
  };

  const handlePriorityChange = async (link: VillageLink, priority: number) => {
    await updateLink(link.item_type as ItemType, link.item_id, { priority });
  };

  const filteredLinkableItems = linkableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLinks = getLinkedItems(activeTab);
  const currentConfig = ITEM_TYPE_CONFIG[activeTab];
  const IconComponent = currentConfig.icon;

  if (!village) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/villages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{village.name} - Local Economy</h1>
            <p className="text-muted-foreground">
              Link marketplace providers, travel packages, and shop products to this village
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ITEM_TYPES.map((type) => {
            const config = ITEM_TYPE_CONFIG[type];
            const TypeIcon = config.icon;
            return (
              <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setMainTab('items'); setActiveTab(type); }}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                      <p className="text-2xl font-bold">{counts[type]}</p>
                    </div>
                    <div className={`p-2 rounded-full ${config.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="items" className="gap-2">
              <Link2 className="h-4 w-4" />
              Linked Items
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Auto-Link
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <VillageLinkSuggestions 
              villageId={id!} 
              villageName={village.name} 
              onCommitComplete={refetch}
            />
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk-import">
            <VillageLinkBulkImport 
              villageId={id!} 
              villageName={village.name}
              onImportComplete={refetch}
            />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <VillageLinkAuditLog 
              villageId={id!}
              onRollbackComplete={refetch}
            />
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">

        {/* Item Type Sub-Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ItemType)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList>
              {ITEM_TYPES.map((type) => {
                const config = ITEM_TYPE_CONFIG[type];
                const TypeIcon = config.icon;
                return (
                  <TabsTrigger key={type} value={type} className="gap-2">
                    <TypeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                    {counts[type] > 0 && (
                      <Badge variant="secondary" className="ml-1">{counts[type]}</Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Link {currentConfig.label}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Link {currentConfig.label} to {village.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-[400px]">
                    {itemsLoading ? (
                      <p className="text-center py-8 text-muted-foreground">Loading...</p>
                    ) : filteredLinkableItems.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No items found</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredLinkableItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                  <IconComponent className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.district && (
                                  <p className="text-sm text-muted-foreground">{item.district}</p>
                                )}
                              </div>
                            </div>
                            {item.isLinked ? (
                              <Badge variant="secondary">Already Linked</Badge>
                            ) : (
                              <Button size="sm" onClick={() => handleLink(item.id)}>
                                <Link2 className="h-4 w-4 mr-1" />
                                Link
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {ITEM_TYPES.map(type => {
            const config = ITEM_TYPE_CONFIG[type];
            const TypeIcon = config.icon;
            const typeLinks = getLinkedItems(type);
            
            return (
              <TabsContent key={type} value={type} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5" />
                      Linked {config.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-8 text-muted-foreground">Loading...</p>
                    ) : typeLinks.length === 0 ? (
                      <div className="text-center py-12">
                        <TypeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No {config.label.toLowerCase()} linked yet
                        </p>
                        <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-24 text-center">Promoted</TableHead>
                            <TableHead className="w-24 text-center">Priority</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeLinks.map(link => (
                            <LinkedItemRow
                              key={link.id}
                              link={link}
                              itemType={type}
                              onTogglePromote={() => handleTogglePromote(link)}
                              onPriorityChange={(p) => handlePriorityChange(link, p)}
                              onUnlink={() => handleUnlink(link.item_type as ItemType, link.item_id)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Separate component to fetch item details
function LinkedItemRow({
  link,
  itemType,
  onTogglePromote,
  onPriorityChange,
  onUnlink
}: {
  link: VillageLink;
  itemType: ItemType;
  onTogglePromote: () => void;
  onPriorityChange: (p: number) => void;
  onUnlink: () => void;
}) {
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    const fetchItem = async () => {
      let data = null;
      if (itemType === 'provider') {
        const { data: p } = await supabase.from('tourism_providers').select('name, image_url').eq('id', link.item_id).single();
        data = p ? { name: p.name, image: p.image_url } : null;
      } else if (itemType === 'listing') {
        const { data: l } = await supabase.from('tourism_listings').select('title, image_url').eq('id', link.item_id).single();
        data = l ? { name: l.title, image: l.image_url } : null;
      } else if (itemType === 'package') {
        const { data: p } = await supabase.from('travel_packages').select('title, thumbnail_image_url').eq('id', link.item_id).single();
        data = p ? { name: p.title, image: p.thumbnail_image_url } : null;
      } else if (itemType === 'product') {
        const { data: p } = await supabase.from('local_products').select('name, thumbnail_image_url').eq('id', link.item_id).single();
        data = p ? { name: p.name, image: p.thumbnail_image_url } : null;
      }
      setItem(data);
    };
    fetchItem();
  }, [link.item_id, itemType]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          {item?.image ? (
            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
          ) : (
            <div className="w-10 h-10 rounded bg-muted" />
          )}
          <span className="font-medium">{item?.name || 'Loading...'}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <Switch checked={link.promote} onCheckedChange={onTogglePromote} />
          {link.promote && <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={link.priority}
          onChange={(e) => onPriorityChange(parseInt(e.target.value) || 0)}
          className="w-16 text-center"
          min={0}
          max={100}
        />
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={link.status === 'linked' ? 'default' : 'secondary'}>
          {link.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={onUnlink} className="text-destructive hover:text-destructive">
          <Unlink className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
