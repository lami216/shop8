import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
        const { user, logout } = useUserStore();
        const isAdmin = user?.role === "admin";
        const { cart } = useCartStore();
        const cartItemCount = cart.reduce((total, item) => total + (item.quantity ?? 0), 0);
        const { t } = useTranslation();

        const cartLink = (
                <Link
                        to={'/cart'}
                        className='relative group flex items-center gap-3 rounded-full border border-payzone-indigo/60 bg-white px-4 py-2 text-sm font-semibold text-magic-navy shadow-sm transition duration-300 ease-in-out hover:bg-white/90'
                >
                        <span className='flex h-9 w-9 items-center justify-center rounded-full border border-payzone-indigo bg-white text-magic-navy shadow-sm transition duration-300 group-hover:brightness-110'>
                                <ShoppingCart size={18} />
                        </span>
                        <span className='hidden sm:inline'>{t("nav.cart")}</span>
                        {cartItemCount > 0 && (
                                <span className='absolute -top-2 -right-2 rounded-full bg-payzone-gold px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition duration-300 ease-in-out group-hover:brightness-110'>
                                        {cartItemCount}
                                </span>
                        )}
                </Link>
        );

        return (
                <header className='fixed top-0 right-0 z-40 w-full border-b border-payzone-indigo/30 bg-magic-navy/95 text-white backdrop-blur-xl shadow-lg transition-all duration-300'>
                        <div className='container mx-auto px-4 py-3'>
                                <div className='flex flex-wrap items-center justify-between gap-4'>
                                        <Link to='/' className='flex items-center gap-3 text-white'>
                                                <img
                                                        src='/magic-logo.png'
                                                        alt='Magic Store'
                                                        className='h-12 w-12 object-contain drop-shadow-[0_4px_12px_rgba(11,47,99,0.35)]'
                                                />
                                                <span className='text-2xl font-semibold uppercase tracking-wide'>{t("common.appName")}</span>
                                        </Link>

                                        <div className='flex flex-wrap items-center gap-4 text-sm font-medium'>
                                                <nav className='flex items-center gap-4'>
                                                        <Link
                                                                to={'/'}
                                                                className='text-white/80 transition duration-300 ease-in-out hover:text-payzone-indigo'
                                                        >
                                                                {t("nav.home")}
                                                        </Link>
                                                        {isAdmin && (
                                                                <Link
                                                                        className='flex items-center gap-2 rounded-full bg-payzone-indigo px-3 py-1 text-magic-navy transition duration-300 ease-in-out hover:brightness-110 shadow'
                                                                        to={'/secret-dashboard'}
                                                                >
                                                                        <Lock className='inline-block' size={18} />
                                                                        <span className='hidden sm:inline'>{t("nav.dashboard")}</span>
                                                                </Link>
                                                        )}
                                                </nav>

                                                <div className='flex items-center gap-3'>
                                                        {cartLink}
                                                        {user ? (
                                                                <button
                                                                        className='flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white/20'
                                                                        onClick={logout}
                                                                >
                                                                        <LogOut size={18} />
                                                                        <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                                </button>
                                                        ) : (
                                                                <>
                                                                        <Link
                                                                                to={'/signup'}
                                                                                className='flex items-center gap-2 rounded-full bg-payzone-gold px-4 py-2 font-semibold text-white shadow-sm transition duration-300 ease-in-out hover:brightness-110'
                                                                        >
                                                                                <UserPlus size={18} />
                                                                                {t("nav.signup")}
                                                                        </Link>
                                                                        <Link
                                                                                to={'/login'}
                                                                                className='flex items-center gap-2 rounded-full bg-payzone-indigo px-4 py-2 text-magic-navy shadow-sm transition duration-300 ease-in-out hover:brightness-110'
                                                                        >
                                                                                <LogIn size={18} />
                                                                                {t("nav.login")}
                                                                        </Link>
                                                                </>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </header>
        );
};
export default Navbar;
