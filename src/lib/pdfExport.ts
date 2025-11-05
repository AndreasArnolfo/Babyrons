import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { ExtendedBaby } from '../state/useBabyStore';
import { Event, BottleEvent, SleepEvent, MedEvent, DiaperEvent, GrowthEvent } from '../data/types';

export async function exportDataToPDF(babies: ExtendedBaby[], events: Event[]): Promise<void> {
  // Charger le logo en base64
  let logoBase64 = '';
  try {
    const logoModule = require('../../assets/images/logo-babyrons.png');
    const asset = Asset.fromModule(logoModule);
    await asset.downloadAsync();
    if (asset.localUri) {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      logoBase64 = `data:image/png;base64,${base64}`;
    }
  } catch (error) {
    console.warn('Impossible de charger le logo:', error);
    // Continuer sans logo si erreur
  }
  // Formatage des événements
  const formatEventDetails = (event: Event): string => {
    switch (event.type) {
      case 'bottle':
        const bottle = event as BottleEvent;
        const kindLabels = {
          breastmilk: 'lait maternel',
          formula: 'préparation',
          mixed: 'mixte',
        };
        const kindLabel = bottle.kind ? ` (${kindLabels[bottle.kind]})` : '';
        return `${bottle.ml} ml${kindLabel}`;
      
      case 'sleep':
        const sleep = event as SleepEvent;
        if (sleep.duration) {
          const hours = Math.floor(sleep.duration / 3600000);
          const minutes = Math.floor((sleep.duration % 3600000) / 60000);
          if (hours > 0) {
            return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
          }
          return `${minutes} min`;
        }
        return 'En cours';
      
      case 'med':
        const med = event as MedEvent;
        return `${med.name}${med.dose ? ` - ${med.dose}` : ''}`;
      
      case 'diaper':
        const diaper = event as DiaperEvent;
        const diaperLabels = {
          wet: 'Mouillée',
          dirty: 'Sale',
          both: 'Les deux',
        };
        return diaperLabels[diaper.kind] || diaper.kind;
      
      case 'growth':
        const growth = event as GrowthEvent;
        const parts: string[] = [];
        if (growth.weightKg) parts.push(`${growth.weightKg} kg`);
        if (growth.heightCm) parts.push(`${growth.heightCm} cm`);
        if (growth.headCircumferenceCm) parts.push(`PC: ${growth.headCircumferenceCm} cm`);
        return parts.join(' • ') || 'Mesures';
      
      default:
        return '';
    }
  };
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  // Statistiques
  const totalEvents = events.length;
  const bottleEvents = events.filter(e => e.type === 'bottle').length;
  const sleepEvents = events.filter(e => e.type === 'sleep').length;
  const medEvents = events.filter(e => e.type === 'med').length;
  const diaperEvents = events.filter(e => e.type === 'diaper').length;
  const growthEvents = events.filter(e => e.type === 'growth').length;
  
  // Générer le HTML pour le PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
          position: relative;
        }
        .header-container {
          position: relative;
          margin-bottom: 20px;
        }
        .logo-container {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 10;
        }
        .logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        h1 {
          color: #FF6B9D;
          font-size: 28px;
          margin-bottom: 10px;
          padding-right: 100px;
        }
        .subtitle {
          color: #666;
          font-size: 12px;
          margin-bottom: 30px;
        }
        h2 {
          color: #333;
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #FFE5EC;
          padding-bottom: 5px;
        }
        h3 {
          color: #555;
          font-size: 16px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .baby-info {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .stat-item {
          padding: 10px;
          background-color: #f0f0f0;
          border-radius: 5px;
        }
        .event-list {
          margin-left: 20px;
        }
        .event-date {
          font-weight: bold;
          color: #666;
          margin-top: 15px;
          margin-bottom: 5px;
        }
        .event-item {
          margin-bottom: 5px;
          padding-left: 10px;
        }
        .event-time {
          font-weight: 600;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        ${logoBase64 ? `<div class="logo-container"><img src="${logoBase64}" alt="Logo Babyrons" class="logo" /></div>` : ''}
        <h1>🍼 Babyrons - Rapport des données</h1>
        <div class="subtitle">Généré le ${dateStr} à ${timeStr}</div>
      </div>
      
      <h2>Vos bébés</h2>
  `;
  
  if (babies.length === 0) {
    htmlContent += '<p>Aucun bébé enregistré</p>';
  } else {
    babies.forEach((baby, index) => {
      htmlContent += `<div class="baby-info">`;
      htmlContent += `<strong>${index + 1}. ${baby.name}</strong>`;
      if (baby.birthDate) {
        const birthDate = new Date(baby.birthDate);
        htmlContent += `<br>Né(e) le ${birthDate.toLocaleDateString('fr-FR')}`;
      }
      if (baby.gender) {
        const genderText = baby.gender === 'male' ? 'Garçon' : 'Fille';
        htmlContent += `<br>Genre: ${genderText}`;
      }
      htmlContent += `</div>`;
    });
  }
  
  htmlContent += `
      <h2>Statistiques générales</h2>
      <div class="stats">
        <div class="stat-item"><strong>Total d'événements:</strong> ${totalEvents}</div>
        <div class="stat-item"><strong>Biberons:</strong> ${bottleEvents}</div>
        <div class="stat-item"><strong>Siestes:</strong> ${sleepEvents}</div>
        <div class="stat-item"><strong>Médicaments:</strong> ${medEvents}</div>
        <div class="stat-item"><strong>Couches:</strong> ${diaperEvents}</div>
        <div class="stat-item"><strong>Mesures de croissance:</strong> ${growthEvents}</div>
      </div>
  `;
  
  // Événements par bébé
  babies.forEach((baby) => {
    const babyEvents = events.filter(e => e.babyId === baby.id).sort((a, b) => b.at - a.at);
    
    if (babyEvents.length > 0) {
      htmlContent += `<h2>Événements - ${baby.name}</h2>`;
      htmlContent += `<div class="event-list">`;
      
      // Grouper par date
      const eventsByDate = new Map<string, Event[]>();
      babyEvents.forEach(event => {
        const date = new Date(event.at).toLocaleDateString('fr-FR');
        if (!eventsByDate.has(date)) {
          eventsByDate.set(date, []);
        }
        eventsByDate.get(date)!.push(event);
      });
      
      const sortedDates = Array.from(eventsByDate.keys()).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      });
      
      sortedDates.forEach(date => {
        htmlContent += `<div class="event-date">${date}</div>`;
        
        const dayEvents = eventsByDate.get(date)!;
        dayEvents.forEach(event => {
          const eventTime = new Date(event.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const eventTypeLabels = {
            bottle: '🍼 Biberon',
            sleep: '😴 Sommeil',
            med: '💊 Médicament',
            diaper: '👶 Couche',
            growth: '📏 Croissance',
          };
          const eventTypeLabel = eventTypeLabels[event.type] || event.type;
          const details = formatEventDetails(event);
          htmlContent += `<div class="event-item"><span class="event-time">${eventTime}</span> - ${eventTypeLabel}: ${details}</div>`;
        });
      });
      
      htmlContent += `</div>`;
    }
  });
  
  htmlContent += `
    </body>
    </html>
  `;
  
  // Générer le PDF
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  });
  
  // Partager le fichier
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Partager le rapport Babyrons',
    });
  } else {
    throw new Error(`PDF créé avec succès !\nEmplacement: ${uri}`);
  }
}

