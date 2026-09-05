import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/product/ProductCard";
import Breadcrumb from "../components/layout/Breadcrumb";
import CategorySidebar from "./CategorySidebar";
import { productsApi } from "../services/api";

function Pagination({ current, total, onChange }) {
	const pages = [];
	const delta = 1;

	for (let i = 1; i <= total; i++) {
		if (
			i === 1 ||
			i === total ||
			(i >= current - delta && i <= current + delta)
		) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== "...") {
			pages.push("...");
		}
	}

	return (
		<nav className="pagination-wrapper" aria-label="Page navigation">
			<div className="pagination-container">
				{/* Previous button */}
				<button
					className={`pagination-btn pagination-arrow ${current <= 1 ? "pagination-disabled" : ""}`}
					onClick={() => current > 1 && onChange(current - 1)}
					disabled={current <= 1}
					aria-label="Previous page"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>

				{/* Page numbers */}
				<div className="pagination-pages">
					{pages.map((p, i) =>
						p === "..." ? (
							<span key={`ellipsis-${i}`} className="pagination-ellipsis">
								…
							</span>
						) : (
							<button
								key={p}
								className={`pagination-btn ${p === current ? "pagination-active" : ""}`}
								onClick={() => p !== current && onChange(p)}
								aria-current={p === current ? "page" : undefined}
							>
								{p}
							</button>
						),
					)}
				</div>

				{/* Next button */}
				<button
					className={`pagination-btn pagination-arrow ${current >= total ? "pagination-disabled" : ""}`}
					onClick={() => current < total && onChange(current + 1)}
					disabled={current >= total}
					aria-label="Next page"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
			</div>

			{/* ===== PAGINATION STYLES ===== */}
			<style>{`
				.pagination-wrapper {
					display: flex;
					justify-content: center;
					margin: 28px 0 12px;
					padding: 8px 0;
				}

				.pagination-container {
					display: flex;
					align-items: center;
					gap: 6px;
					background: #fff;
					padding: 4px 6px;
					border-radius: 12px;
					border: 1px solid #e8ecf0;
					box-shadow: 0 1px 4px rgba(0,0,0,0.02);
				}

				.pagination-pages {
					display: flex;
					align-items: center;
					gap: 4px;
				}

				.pagination-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 36px;
					height: 36px;
					padding: 0 10px;
					border: none;
					border-radius: 8px;
					background: transparent;
					color: #3d414a;
					font-size: 0.85rem;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s ease;
					font-family: inherit;
					letter-spacing: -0.01em;
				}

				.pagination-btn:hover:not(.pagination-disabled):not(.pagination-active) {
					background: #f0f2f5;
					color: #0b1a33;
				}

				.pagination-btn:active:not(.pagination-disabled) {
					transform: scale(0.94);
				}

				.pagination-active {
					background: #0b1a33;
					color: #fff;
					font-weight: 600;
					box-shadow: 0 2px 8px rgba(11, 26, 51, 0.15);
				}

				.pagination-active:hover {
					background: #1a2d4a;
				}

				.pagination-arrow {
					min-width: 36px;
					padding: 0;
					color: #3d414a;
					border-radius: 8px;
				}

				.pagination-arrow:hover:not(.pagination-disabled) {
					background: #f0f2f5;
					color: #0b1a33;
				}

				.pagination-disabled {
					opacity: 0.35;
					cursor: not-allowed;
					pointer-events: none;
				}

				.pagination-ellipsis {
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 36px;
					height: 36px;
					color: #9aa2b0;
					font-size: 0.9rem;
					font-weight: 500;
					letter-spacing: 0.02em;
				}

				/* ===== RESPONSIVE ===== */
				@media (max-width: 768px) {
					.pagination-container {
						gap: 4px;
						padding: 3px 4px;
					}

					.pagination-btn {
						min-width: 32px;
						height: 32px;
						font-size: 0.75rem;
						padding: 0 8px;
					}

					.pagination-arrow {
						min-width: 32px;
					}

					.pagination-ellipsis {
						min-width: 32px;
						height: 32px;
						font-size: 0.8rem;
					}

					.pagination-arrow svg {
						width: 14px;
						height: 14px;
					}
				}

				@media (max-width: 480px) {
					.pagination-container {
						gap: 2px;
						padding: 2px 3px;
						border-radius: 10px;
					}

					.pagination-btn {
						min-width: 28px;
						height: 28px;
						font-size: 0.7rem;
						padding: 0 6px;
						border-radius: 6px;
					}

					.pagination-arrow {
						min-width: 28px;
					}

					.pagination-ellipsis {
						min-width: 28px;
						height: 28px;
						font-size: 0.7rem;
					}

					.pagination-arrow svg {
						width: 12px;
						height: 12px;
					}
				}
			`}</style>
		</nav>
	);
}

const TAG_FILTERS = [
	{ label: "🔥 Trending", value: "trending" },
	{ label: "🆕 New", value: "new" },
	{ label: "💸 Deals", value: "deals" },
	{ label: "🏷 Sale", value: "sale" },
	{ label: "🌶 Hot", value: "hot" },
];

const SORT_OPTIONS = [
	{ label: "Newest", value: "newest" },
	{ label: "Price ↑", value: "price_asc" },
	{ label: "Price ↓", value: "price_desc" },
	{ label: "Top Rated", value: "rating_desc" },
];

export default function ProductsPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const q = searchParams.get("q") ?? "";
	const category = searchParams.get("category") ?? "";
	const sort = searchParams.get("sort") ?? "newest";
	const tag = searchParams.get("tag") ?? "";
	const minPrice = searchParams.get("min_price") ?? "";
	const maxPrice = searchParams.get("max_price") ?? "";

	const [products, setProducts] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setPage(1);
	}, [q, category, sort, tag, minPrice, maxPrice]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);

		productsApi
			.list({
				q,
				category,
				sort,
				tag,
				min_price: minPrice,
				max_price: maxPrice,
				page,
				per_page: 20,
			})
			.then((data) => {
				if (cancelled) return;
				setProducts(data.products ?? []);
				setPagination(data.pagination ?? null);
			})
			.catch((err) => {
				if (!cancelled) setError(err.message ?? "Failed to load products.");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [q, category, sort, tag, minPrice, maxPrice, page]);

	const setParam = (key, val) => {
		const p = new URLSearchParams(searchParams);
		if (val) p.set(key, val);
		else p.delete(key);
		setSearchParams(p, { replace: true });
	};

	const clearAll = () => setSearchParams({}, { replace: true });

	const isFiltered = q || category || tag || minPrice || maxPrice;

	return (
		<div className="container">
			<Breadcrumb crumbs={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

			<div className="row">
				<div className="col-lg-2 col-12">
					<CategorySidebar />
				</div>

				<div className="col-lg-10 col-12">
					{/* ===== FILTER STRIP ===== */}
					<div className="filter-strip-wrapper">
						<div className="filter-strip">
							<div className="filter-buttons">
								{TAG_FILTERS.map((tf) => (
									<motion.button
										key={tf.value}
										className={`filter-pill ${tag === tf.value ? "filter-pill-active" : ""}`}
										onClick={() => setParam("tag", tag === tf.value ? "" : tf.value)}
										whileTap={{ scale: 0.95 }}
									>
										{tf.label}
									</motion.button>
								))}
							</div>

							<div className="filter-sort-wrapper">
								<select
									className="sort-select"
									value={sort}
									onChange={(e) => setParam("sort", e.target.value)}
									aria-label="Sort products"
								>
									{SORT_OPTIONS.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Active filters bar */}
						{isFiltered && !loading && (
							<motion.div
								className="filter-active-bar"
								initial={{ opacity: 0, y: -6 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<span>
									{pagination &&
										`${pagination.total} ${pagination.total === 1 ? "product" : "products"}`}
									{q && (
										<>
											{" "}
											matching <strong>"{q}"</strong>
										</>
									)}
									{category && (
										<>
											{" "}
											in <strong>{category}</strong>
										</>
									)}
									{tag && (
										<>
											{" "}
											tagged <strong>{tag}</strong>
										</>
									)}
								</span>
								<button className="filter-clear-btn" onClick={clearAll}>
									Clear all ✕
								</button>
							</motion.div>
						)}
					</div>

					{/* ===== PRODUCTS ===== */}
					{error && <div className="alert alert-danger">{error}</div>}

					{loading ? (
						<div className="row">
							{[...Array(8)].map((_, i) => (
								<div key={i} className="col-xl-3 col-lg-4 col-md-6 col-6">
									<div className="product-skeleton" aria-hidden="true" />
								</div>
							))}
						</div>
					) : products.length === 0 ? (
						<motion.div
							className="no-results text-center py-5"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							data-testid="no-results"
						>
							<div style={{ fontSize: "3rem", marginBottom: 8 }}>
								{tag === "trending"
									? "🔥"
									: tag === "new"
										? "🆕"
										: tag === "deals"
											? "💸"
											: tag === "sale"
												? "🏷"
												: tag === "hot"
													? "🌶"
													: "🔍"}
							</div>
							<h4 style={{ color: "#555" }}>
								{tag
									? `No ${tag} items available right now`
									: "No products found"}
							</h4>
							<p className="text-muted" style={{ fontSize: "0.9rem" }}>
								{tag
									? "Check back soon — products with this tag will appear here."
									: "Try adjusting your filters or browsing all products."}
							</p>
							<button className="btn mt-3" onClick={clearAll}>
								Browse All Products
							</button>
						</motion.div>
					) : (
						<>
							<AnimatePresence mode="wait">
								<motion.div
									key={`${q}-${category}-${tag}-${page}`}
									className="row"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									{products.map((product, i) => (
										<motion.div
											key={product.id}
											className="col-xl-3 col-lg-4 col-md-6 col-6"
											initial={{ opacity: 0, transform: 'translateY(16px)' }}
											animate={{ opacity: 1, transform: 'translateY(0px)' }}
											transition={{
												delay: Math.min(i, 5) * 0.04,
												duration: 0.25,
												ease: [0.23, 1, 0.32, 1],
											}}
										>
											<ProductCard product={product} />
										</motion.div>
									))}
								</motion.div>
							</AnimatePresence>

							{pagination && pagination.last_page > 1 && (
								<Pagination
									current={pagination.current_page}
									total={pagination.last_page}
									onChange={setPage}
								/>
							)}
						</>
					)}
				</div>
			</div>

			{/* ===== FILTER STRIP STYLES ===== */}
			<style>{`
				/* ===== FILTER STRIP WRAPPER ===== */
				.filter-strip-wrapper {
					width: 100%;
					background: #fff;
					border-radius: 12px;
					padding: 12px 16px;
					margin-bottom: 20px;
					border: 1px solid #e8ecf0;
					box-shadow: 0 1px 4px rgba(0,0,0,0.02);
				}

				/* ===== FILTER STRIP ===== */
				.filter-strip {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					flex-wrap: nowrap;
				}

				.filter-buttons {
					display: flex;
					align-items: center;
					gap: 8px;
					flex-wrap: nowrap;
					overflow-x: auto;
					padding: 2px 0;
					-webkit-overflow-scrolling: touch;
					scrollbar-width: none;
				}
				.filter-buttons::-webkit-scrollbar {
					display: none;
				}

				/* ===== FILTER PILLS ===== */
				.filter-pill {
					padding: 6px 16px;
					border-radius: 20px;
					border: 1.5px solid #dce0e6;
					background: #f7f8fa;
					color: #3d414a;
					font-size: 0.8rem;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s ease;
					white-space: nowrap;
					font-family: inherit;
					letter-spacing: -0.01em;
				}
				.filter-pill:hover {
					background: #eef0f4;
					border-color: #bcc3cd;
					transform: translateY(-1px);
				}
				.filter-pill:active {
					transform: scale(0.96);
				}

				.filter-pill-active {
					background: #0b1a33;
					color: #fff;
					border-color: #0b1a33;
					box-shadow: 0 2px 8px rgba(11, 26, 51, 0.15);
				}
				.filter-pill-active:hover {
					background: #1a2d4a;
					border-color: #1a2d4a;
				}

				/* ===== SORT SELECT ===== */
				.filter-sort-wrapper {
					flex-shrink: 0;
				}

				.sort-select {
					padding: 6px 32px 6px 14px;
					border-radius: 20px;
					border: 1.5px solid #dce0e6;
					background: #f7f8fa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233d414a' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
					background-size: 10px;
					appearance: none;
					font-size: 0.8rem;
					font-weight: 500;
					color: #3d414a;
					cursor: pointer;
					transition: all 0.2s ease;
					font-family: inherit;
					min-width: 130px;
				}
				.sort-select:hover {
					background-color: #eef0f4;
					border-color: #bcc3cd;
				}
				.sort-select:focus {
					outline: none;
					border-color: #0b1a33;
					box-shadow: 0 0 0 3px rgba(11, 26, 51, 0.08);
				}

				/* ===== ACTIVE FILTERS BAR ===== */
				.filter-active-bar {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 10px 4px 4px 4px;
					margin-top: 10px;
					border-top: 1px solid #e8ecf0;
					font-size: 0.85rem;
					color: #3d414a;
					flex-wrap: wrap;
					gap: 8px;
				}
				.filter-active-bar span {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					gap: 4px;
				}
				.filter-active-bar strong {
					color: #0b1a33;
					font-weight: 600;
				}

				.filter-clear-btn {
					background: none;
					border: none;
					color: #6b7280;
					font-size: 0.8rem;
					font-weight: 500;
					cursor: pointer;
					padding: 4px 12px;
					border-radius: 16px;
					transition: all 0.2s ease;
					font-family: inherit;
					white-space: nowrap;
				}
				.filter-clear-btn:hover {
					background: #f0f2f4;
					color: #0b1a33;
				}

				/* ===== RESPONSIVE ===== */
				@media (max-width: 768px) {
					.filter-strip-wrapper {
						padding: 10px 12px;
					}
					.filter-strip {
						flex-wrap: nowrap;
					}
					.filter-buttons {
						gap: 6px;
					}
					.filter-pill {
						font-size: 0.7rem;
						padding: 5px 12px;
					}
					.sort-select {
						font-size: 0.7rem;
						padding: 5px 28px 5px 10px;
						min-width: 110px;
					}
					.filter-active-bar {
						font-size: 0.75rem;
						flex-direction: column;
						align-items: flex-start;
						gap: 6px;
					}
					.filter-clear-btn {
						font-size: 0.7rem;
						padding: 2px 10px;
					}
				}

				@media (max-width: 480px) {
					.filter-strip-wrapper {
						padding: 8px 10px;
					}
					.filter-pill {
						font-size: 0.65rem;
						padding: 4px 10px;
					}
					.sort-select {
						font-size: 0.65rem;
						padding: 4px 24px 4px 8px;
						min-width: 90px;
					}
				}
			`}</style>
		</div>
	);
}