import { useState, useRef, useEffect, useCallback } from 'react';
import { CHECK_INTERVAL, ACTIVITY_EVENTS, INTERACTIVE_ELEMENTS, INACTIVITY_TIMEOUT } from './constants';
import { updateLastActivity } from './inactivityService';
import { useCart } from '../../../context/CartContext';

export const useInactivity = (user, onLogout) => {
    const [lastActivity, setLastActivity] = useState(Date.now());
    const initialDelayRef = useRef(null);
    const monitoringTimeoutRef = useRef(null);
    const isMonitoringRef = useRef(false);
    const isWaitingRef = useRef(false);
    const { clearCartForInactivity: clearCartForInactivityContext } = useCart();

    const isInteractiveElement = useCallback((element) => {
        if (!element) return false;
        
        const tagName = element.tagName?.toLowerCase();
        if (!tagName) return false;

        // Verificar si el elemento es interactivo
        if (tagName === INTERACTIVE_ELEMENTS.BUTTON ||
            tagName === INTERACTIVE_ELEMENTS.LINK ||
            tagName === INTERACTIVE_ELEMENTS.INPUT) {
            return true;
        }

        // Verificar si el elemento tiene un padre interactivo
        let parent = element.parentElement;
        while (parent) {
            const parentTagName = parent.tagName?.toLowerCase();
            if (parentTagName === INTERACTIVE_ELEMENTS.BUTTON ||
                parentTagName === INTERACTIVE_ELEMENTS.LINK ||
                parentTagName === INTERACTIVE_ELEMENTS.INPUT) {
                return true;
            }
            parent = parent.parentElement;
        }

        return false;
    }, []);

    const handleInactivity = useCallback(async () => {
        try {
            // Limpiar el carrito
            console.log('🧹 Limpiando carrito por inactividad...');
            await clearCartForInactivityContext();
            
            // Cerrar la sesión
            console.log('🔒 Cerrando sesión por inactividad...');
            await onLogout();
            console.log('✅ Sesión cerrada exitosamente');
        } catch (error) {
            console.error('❌ Error durante el proceso de inactividad:', error);
        }
    }, [clearCartForInactivityContext, onLogout]);

    const startMonitoring = useCallback(async () => {
        console.log('⏳ Iniciando tiempo de detección de actividad...');
        isMonitoringRef.current = true;
        isWaitingRef.current = false;
        
        monitoringTimeoutRef.current = setTimeout(async () => {
            console.log('❌ No se detectó actividad durante el tiempo de monitoreo');
            isMonitoringRef.current = false;
            
            // Manejar la inactividad
            if (user) {
                await handleInactivity();
            }
        }, CHECK_INTERVAL);
    }, [user, handleInactivity]);

    const handleActivity = useCallback((event) => {
        const target = event.target;
        
        // Solo detectar actividad si estamos en modo de monitoreo y no en tiempo de espera
        if (isInteractiveElement(target) && isMonitoringRef.current && !isWaitingRef.current) {
            console.log('✅ Actividad detectada:', target.tagName);
            const now = updateLastActivity();
            setLastActivity(now);
            
            // Si detecta actividad, regresa al tiempo de espera
            console.log('⏳ Volviendo a tiempo de espera...');
            isMonitoringRef.current = false;
            isWaitingRef.current = true;
            
            // Limpiar todos los timeouts
            if (monitoringTimeoutRef.current) {
                clearTimeout(monitoringTimeoutRef.current);
                monitoringTimeoutRef.current = null;
            }
            if (initialDelayRef.current) {
                clearTimeout(initialDelayRef.current);
                initialDelayRef.current = null;
            }
            
            // Iniciar tiempo de espera
            initialDelayRef.current = setTimeout(() => {
                console.log('⏰ Tiempo de espera completado, iniciando monitoreo...');
                startMonitoring();
            }, INACTIVITY_TIMEOUT);
        }
    }, [isInteractiveElement, startMonitoring]);

    const startInactivityCheck = useCallback(() => {
        if (!user) {
            console.log('❌ Usuario no autenticado, no se iniciará el monitoreo');
            return;
        }

        // Iniciar tiempo de espera
        console.log('⏳ Iniciando tiempo de espera inicial...');
        isWaitingRef.current = true;
        
        initialDelayRef.current = setTimeout(() => {
            console.log('⏰ Tiempo de espera completado, iniciando monitoreo...');
            startMonitoring();
        }, INACTIVITY_TIMEOUT);
    }, [user, startMonitoring]);

    useEffect(() => {
        if (user) {
            console.log('👤 Usuario autenticado, iniciando sistema de inactividad');
            ACTIVITY_EVENTS.forEach(event => {
                window.addEventListener(event, handleActivity);
            });
            
            startInactivityCheck();

            return () => {
                console.log('🧹 Limpiando listeners y timeouts...');
                ACTIVITY_EVENTS.forEach(event => {
                    window.removeEventListener(event, handleActivity);
                });
                
                if (initialDelayRef.current) {
                    clearTimeout(initialDelayRef.current);
                }
                if (monitoringTimeoutRef.current) {
                    clearTimeout(monitoringTimeoutRef.current);
                }
                
                initialDelayRef.current = null;
                monitoringTimeoutRef.current = null;
                isMonitoringRef.current = false;
                isWaitingRef.current = false;
            };
        } else {
            console.log('👤 Usuario no autenticado, monitoreo desactivado');
        }
    }, [user]);

    return { handleActivity };
}; 