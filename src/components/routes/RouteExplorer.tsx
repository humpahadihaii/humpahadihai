import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RouteExplorerHeader } from "./RouteExplorerHeader";
import { RouteCategories } from "./RouteCategories";
import { RouteDistricts } from "./RouteDistricts";
import { RoutePlaces } from "./RoutePlaces";
import { RouteCategory, RouteDistrict, PlaceGuide } from "@/hooks/useRouteExplorer";

interface RouteExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "categories" | "districts" | "places";

interface ExplorerState {
  step: Step;
  category: RouteCategory | null;
  district: RouteDistrict | null;
}

export function RouteExplorer({ isOpen, onClose }: RouteExplorerProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<ExplorerState>({
    step: "categories",
    category: null,
    district: null,
  });

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setState({ step: "categories", category: null, district: null });
    }
  }, [isOpen]);

  const handleSelectCategory = useCallback((category: RouteCategory) => {
    setState((prev) => ({ ...prev, step: "districts", category }));
  }, []);

  const handleSelectDistrict = useCallback((district: RouteDistrict) => {
    setState((prev) => ({ ...prev, step: "places", district }));
  }, []);

  const handleSelectPlace = useCallback(
    (place: PlaceGuide) => {
      const categorySlug = state.category?.slug || "explore";
      const districtSlug = state.district?.slug || "district";
      navigate(`/routes/${categorySlug}/${districtSlug}/${place.slug}`);
      onClose();
    },
    [navigate, onClose, state.category, state.district]
  );

  const handleBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === "places") {
        return { ...prev, step: "districts", district: null };
      }
      if (prev.step === "districts") {
        return { ...prev, step: "categories", category: null };
      }
      return prev;
    });
  }, []);

  const getBreadcrumbs = useCallback(() => {
    const crumbs: { label: string; onClick?: () => void }[] = [
      {
        label: "Routes",
        onClick:
          state.step !== "categories"
            ? () =>
                setState({
                  step: "categories",
                  category: null,
                  district: null,
                })
            : undefined,
      },
    ];

    if (state.category) {
      crumbs.push({
        label: state.category.name,
        onClick:
          state.step !== "districts"
            ? () =>
                setState((prev) => ({
                  ...prev,
                  step: "districts",
                  district: null,
                }))
            : undefined,
      });
    }

    if (state.district) {
      crumbs.push({
        label: state.district.name,
      });
    }

    return crumbs;
  }, [state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <RouteExplorerHeader
        breadcrumbs={getBreadcrumbs()}
        onBack={handleBack}
        onClose={onClose}
        showBack={state.step !== "categories"}
      />

      <main className="flex-1 overflow-hidden">
        {state.step === "categories" && (
          <RouteCategories onSelectCategory={handleSelectCategory} />
        )}
        {state.step === "districts" && state.category && (
          <RouteDistricts
            categoryId={state.category.id}
            onSelectDistrict={handleSelectDistrict}
          />
        )}
        {state.step === "places" && state.district && state.category && (
          <RoutePlaces
            districtId={state.district.id}
            districtSlug={state.district.slug}
            categorySlug={state.category.slug}
            onSelectPlace={handleSelectPlace}
          />
        )}
      </main>
    </div>
  );
}
