import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ItemType = 'provider' | 'listing' | 'package' | 'product';
export type LinkStatus = 'linked' | 'pending' | 'archived';

export interface VillageLink {
  id: string;
  village_id: string;
  item_type: ItemType;
  item_id: string;
  promote: boolean;
  priority: number;
  status: LinkStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  item_name?: string;
  item_image?: string;
  item_price?: number;
}

export interface LinkableItem {
  id: string;
  name: string;
  type: ItemType;
  image?: string;
  district?: string;
  village?: string;
  isLinked?: boolean;
}

export const useVillageLinks = (villageId: string | undefined) => {
  const [links, setLinks] = useState<VillageLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    provider: 0,
    listing: 0,
    package: 0,
    product: 0
  });

  const fetchLinks = useCallback(async () => {
    if (!villageId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('village_links')
        .select('*')
        .eq('village_id', villageId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLinks(data || []);
      
      // Calculate counts
      const newCounts = { provider: 0, listing: 0, package: 0, product: 0 };
      (data || []).forEach((link: VillageLink) => {
        if (link.status === 'linked' && newCounts[link.item_type] !== undefined) {
          newCounts[link.item_type]++;
        }
      });
      setCounts(newCounts);
    } catch (error) {
      console.error('Error fetching village links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [villageId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const linkItem = async (
    itemType: ItemType,
    itemId: string,
    options?: { promote?: boolean; priority?: number; status?: LinkStatus }
  ) => {
    if (!villageId) return { success: false, error: 'No village ID' };

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Get current state for audit
      const { data: existing } = await (supabase as any)
        .from('village_links')
        .select('*')
        .eq('village_id', villageId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      const linkData = {
        village_id: villageId,
        item_type: itemType,
        item_id: itemId,
        promote: options?.promote ?? false,
        priority: options?.priority ?? 0,
        status: options?.status ?? 'linked',
        created_by: user?.user?.id
      };

      // Upsert (idempotent)
      const { data, error } = await (supabase as any)
        .from('village_links')
        .upsert(linkData, { 
          onConflict: 'village_id,item_type,item_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await (supabase as any).from('village_link_audit').insert({
        village_id: villageId,
        item_type: itemType,
        item_id: itemId,
        action: existing ? 'update' : 'link',
        before_state: existing || null,
        after_state: data,
        changed_by: user?.user?.id
      });

      await fetchLinks();
      toast.success('Item linked successfully');
      return { success: true, link: data };
    } catch (error: any) {
      console.error('Error linking item:', error);
      toast.error(error.message || 'Failed to link item');
      return { success: false, error: error.message };
    }
  };

  const unlinkItem = async (itemType: ItemType, itemId: string, hardDelete = false) => {
    if (!villageId) return { success: false, error: 'No village ID' };

    try {
      const { data: user } = await supabase.auth.getUser();

      // Get current state for audit
      const { data: existing } = await (supabase as any)
        .from('village_links')
        .select('*')
        .eq('village_id', villageId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (!existing) {
        return { success: true }; // Already unlinked (idempotent)
      }

      if (hardDelete) {
        const { error } = await (supabase as any)
          .from('village_links')
          .delete()
          .eq('village_id', villageId)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (error) throw error;
      } else {
        // Soft delete
        const { error } = await (supabase as any)
          .from('village_links')
          .update({ status: 'archived' })
          .eq('village_id', villageId)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (error) throw error;
      }

      // Log audit
      await (supabase as any).from('village_link_audit').insert({
        village_id: villageId,
        item_type: itemType,
        item_id: itemId,
        action: 'unlink',
        before_state: existing,
        after_state: hardDelete ? null : { ...existing, status: 'archived' },
        changed_by: user?.user?.id
      });

      await fetchLinks();
      toast.success('Item unlinked');
      return { success: true };
    } catch (error: any) {
      console.error('Error unlinking item:', error);
      toast.error(error.message || 'Failed to unlink item');
      return { success: false, error: error.message };
    }
  };

  const updateLink = async (
    itemType: ItemType,
    itemId: string,
    updates: { promote?: boolean; priority?: number; status?: LinkStatus }
  ) => {
    if (!villageId) return { success: false, error: 'No village ID' };

    try {
      const { data: user } = await supabase.auth.getUser();

      const { data: existing } = await (supabase as any)
        .from('village_links')
        .select('*')
        .eq('village_id', villageId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (!existing) {
        return { success: false, error: 'Link not found' };
      }

      const { data, error } = await (supabase as any)
        .from('village_links')
        .update(updates)
        .eq('village_id', villageId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await (supabase as any).from('village_link_audit').insert({
        village_id: villageId,
        item_type: itemType,
        item_id: itemId,
        action: 'update',
        before_state: existing,
        after_state: data,
        changed_by: user?.user?.id
      });

      await fetchLinks();
      toast.success('Link updated');
      return { success: true, link: data };
    } catch (error: any) {
      console.error('Error updating link:', error);
      toast.error(error.message || 'Failed to update link');
      return { success: false, error: error.message };
    }
  };

  const getLinkedItems = (itemType: ItemType, includeArchived = false) => {
    return links.filter(
      l => l.item_type === itemType && (includeArchived || l.status === 'linked')
    );
  };

  return {
    links,
    counts,
    isLoading,
    linkItem,
    unlinkItem,
    updateLink,
    getLinkedItems,
    refetch: fetchLinks
  };
};

// Hook to fetch linkable items (providers, listings, packages, products)
export const useLinkableItems = (itemType: ItemType, villageId?: string) => {
  const [items, setItems] = useState<LinkableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let data: any[] = [];
        
        if (itemType === 'provider') {
          const { data: providers } = await supabase
            .from('tourism_providers')
            .select('id, name, image_url, district_id')
            .eq('is_active', true);
          data = (providers || []).map(p => ({
            id: p.id,
            name: p.name,
            type: 'provider' as ItemType,
            image: p.image_url
          }));
        } else if (itemType === 'listing') {
          const { data: listings } = await supabase
            .from('tourism_listings')
            .select('id, title, image_url, provider_id')
            .eq('is_active', true);
          data = (listings || []).map(l => ({
            id: l.id,
            name: l.title,
            type: 'listing' as ItemType,
            image: l.image_url
          }));
        } else if (itemType === 'package') {
          const { data: packages } = await supabase
            .from('travel_packages')
            .select('id, title, thumbnail_image_url')
            .eq('is_active', true);
          data = (packages || []).map(p => ({
            id: p.id,
            name: p.title,
            type: 'package' as ItemType,
            image: p.thumbnail_image_url
          }));
        } else if (itemType === 'product') {
          const { data: products } = await supabase
            .from('local_products')
            .select('id, name, thumbnail_image_url')
            .eq('is_active', true);
          data = (products || []).map(p => ({
            id: p.id,
            name: p.name,
            type: 'product' as ItemType,
            image: p.thumbnail_image_url
          }));
        }

        // Mark items that are already linked
        if (villageId) {
          const { data: existingLinks } = await (supabase as any)
            .from('village_links')
            .select('item_id')
            .eq('village_id', villageId)
            .eq('item_type', itemType)
            .eq('status', 'linked');

          const linkedIds = new Set((existingLinks || []).map((l: any) => l.item_id));
          data = data.map(item => ({
            ...item,
            isLinked: linkedIds.has(item.id)
          }));
        }

        setItems(data);
      } catch (error) {
        console.error('Error fetching linkable items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [itemType, villageId]);

  return { items, isLoading };
};

// Hook to fetch linked items with full details for public display
export const useVillageLinkedContent = (villageId: string | undefined) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!villageId) return;
      
      setIsLoading(true);
      try {
        // Get all linked items for this village
        const { data: links } = await (supabase as any)
          .from('village_links')
          .select('item_type, item_id, promote, priority')
          .eq('village_id', villageId)
          .eq('status', 'linked')
          .order('promote', { ascending: false })
          .order('priority', { ascending: false });

        if (!links || links.length === 0) {
          setIsLoading(false);
          return;
        }

        const providerIds = links.filter((l: any) => l.item_type === 'provider').map((l: any) => l.item_id);
        const listingIds = links.filter((l: any) => l.item_type === 'listing').map((l: any) => l.item_id);
        const packageIds = links.filter((l: any) => l.item_type === 'package').map((l: any) => l.item_id);
        const productIds = links.filter((l: any) => l.item_type === 'product').map((l: any) => l.item_id);

        // Fetch each type in parallel
        const [providersRes, listingsRes, packagesRes, productsRes] = await Promise.all([
          providerIds.length > 0 
            ? supabase.from('tourism_providers').select('*').in('id', providerIds).eq('is_active', true)
            : { data: [] },
          listingIds.length > 0 
            ? supabase.from('tourism_listings').select('*').in('id', listingIds).eq('is_active', true)
            : { data: [] },
          packageIds.length > 0 
            ? supabase.from('travel_packages').select('*').in('id', packageIds).eq('is_active', true)
            : { data: [] },
          productIds.length > 0 
            ? supabase.from('local_products').select('*').in('id', productIds).eq('is_active', true)
            : { data: [] }
        ]);

        setProviders(providersRes.data || []);
        setListings(listingsRes.data || []);
        setPackages(packagesRes.data || []);
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error fetching village content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [villageId]);

  return { providers, listings, packages, products, isLoading };
};
