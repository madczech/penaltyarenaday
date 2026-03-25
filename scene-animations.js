;(function () {
  'use strict'

  const C = {
    bg:      '#0c0c0c',
    surface: '#161616',
    s2:      '#1e1e1e',
    dim:     '#262626',
    mid:     '#3a3a3a',
    muted:   '#666',
    light:   '#999',
    accent:  '#e8c53a',
    red:     '#c0392b',
    green:   '#2EB67D',
    blue:    '#36C5F0',
  }

  const lerp  = (a, b, t) => a + (b - a) * t
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const ease  = t => t < .5 ? 2*t*t : -1+(4-2*t)*t
  const PI    = Math.PI

  // ─── Base class ───────────────────────────────────────────────────────────
  class SceneAnim {
    constructor(el, n) {
      this.n = n
      this.t = 0
      this.raf = null

      const cv = document.createElement('canvas')
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
      el.appendChild(cv)
      this.cv = cv

      this._loop = this._loop.bind(this)
      const ro = new ResizeObserver(() => this._resize())
      ro.observe(el)
      this._resize()

      const io = new IntersectionObserver(e => e[0].isIntersecting ? this._start() : this._stop(), { threshold: 0.1 })
      io.observe(el)
    }

    _resize() {
      const dpr = devicePixelRatio || 1
      const r = this.cv.parentElement.getBoundingClientRect()
      if (!r.width) return
      this.cv.width  = Math.round(r.width  * dpr)
      this.cv.height = Math.round(r.height * dpr)
      this.w  = r.width
      this.h  = r.height
      this.cx = r.width  / 2
      this.cy = r.height / 2
    }

    _start() { if (!this.raf) this.raf = requestAnimationFrame(this._loop) }
    _stop()  { cancelAnimationFrame(this.raf); this.raf = null }

    _loop() {
      this.t++
      const ctx = this.cv.getContext('2d')
      const dpr = devicePixelRatio || 1
      ctx.save(); ctx.scale(dpr, dpr)
      this.ctx = ctx
      this[`s${this.n}`]()
      ctx.restore()
      this.raf = requestAnimationFrame(this._loop)
    }

    // ── helpers ──────────────────────────────────────────────────────────────
    bg(col = C.bg) {
      const c = this.ctx
      c.fillStyle = col
      c.fillRect(0, 0, this.w, this.h)
    }

    grid(alpha = 0.03, step = 36) {
      const c = this.ctx
      c.strokeStyle = `rgba(255,255,255,${alpha})`
      c.lineWidth = .5
      for (let x = 0; x < this.w; x += step) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,this.h); c.stroke() }
      for (let y = 0; y < this.h; y += step) { c.beginPath(); c.moveTo(0,y); c.lineTo(this.w,y); c.stroke() }
    }

    disc(x, y, r, col) {
      const c = this.ctx
      c.beginPath(); c.arc(x, y, r, 0, PI*2)
      c.fillStyle = col; c.fill()
    }

    ring(x, y, r, col, lw = 1.5) {
      const c = this.ctx
      c.beginPath(); c.arc(x, y, r, 0, PI*2)
      c.strokeStyle = col; c.lineWidth = lw; c.stroke()
    }

    box(x, y, w, h, col, r = 0) {
      const c = this.ctx
      c.beginPath(); c.roundRect(x, y, w, h, r)
      c.fillStyle = col; c.fill()
    }

    boxStroke(x, y, w, h, col, lw = 1.5, r = 0) {
      const c = this.ctx
      c.beginPath(); c.roundRect(x, y, w, h, r)
      c.strokeStyle = col; c.lineWidth = lw; c.stroke()
    }

    ln(x1, y1, x2, y2, col, lw = 2) {
      const c = this.ctx
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2)
      c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.stroke()
    }

    figure(x, y, size, col, wt) {
      const c = this.ctx, s = size
      c.strokeStyle = col; c.fillStyle = col
      c.lineWidth = s * .07; c.lineCap = 'round'
      c.beginPath(); c.arc(x, y - s*.72, s*.12, 0, PI*2); c.fill()
      c.beginPath(); c.moveTo(x, y-s*.58); c.lineTo(x, y-s*.24); c.stroke()
      const sw = Math.sin(wt) * .4
      c.beginPath(); c.moveTo(x, y-s*.48); c.lineTo(x + s*.22*Math.cos(sw+1.2), y-s*.4 + s*.1*Math.sin(sw)); c.stroke()
      c.beginPath(); c.moveTo(x, y-s*.48); c.lineTo(x - s*.22*Math.cos(sw+1.2), y-s*.4 + s*.1*Math.sin(-sw)); c.stroke()
      c.beginPath(); c.moveTo(x, y-s*.24); c.lineTo(x + s*.18*Math.sin(sw), y); c.stroke()
      c.beginPath(); c.moveTo(x, y-s*.24); c.lineTo(x - s*.18*Math.sin(sw), y); c.stroke()
    }

    // ── SCÉNA 1 – Slack potvrzení ─────────────────────────────────────────────
    s1() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      // Telefon
      const pw = w*.18, ph = h*.78, px = cx-pw/2, py = cy-ph/2
      this.box(px, py, pw, ph, C.surface, 10)
      this.boxStroke(px, py, pw, ph, C.mid, 1.5, 10)
      this.box(px+3, py+8, pw-6, ph-16, '#0d0d0d', 6)

      // Slack 4-barevné čtverce
      const sq = (pw-10)/2-1
      ;[['#E01E5A','#36C5F0'],['#2EB67D','#ECB22E']].forEach((row, ri) =>
        row.forEach((col, ci) => this.box(px+4+ci*(sq+2), py+12+ri*(sq+2), sq, sq, col, 3)))

      // Řádky zpráv
      for (let i=0; i<4; i++) {
        this.ctx.globalAlpha = i===1 ? .6 : .18
        this.box(px+5, py+ph*.34+i*10, (pw-10)*[.8,.98,.65,.75][i], 3, '#fff', 2)
        this.ctx.globalAlpha = 1
      }

      // Palec nahoru
      const pulse = .82 + .18*Math.sin(t*.05)
      const tx = px+pw+w*.16, ty = cy-h*.04, tr = h*.13*pulse
      this.ctx.globalAlpha = .12; this.disc(tx, ty, tr, C.accent)
      this.ctx.globalAlpha = .3;  this.disc(tx, ty, tr*.55, C.accent)
      this.ctx.globalAlpha = 1
      this.ctx.font=`${h*.12*pulse}px serif`
      this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
      this.ctx.fillText('👍', tx, ty)

      // Přerušovaná linka
      this.ctx.setLineDash([3,5])
      this.ctx.globalAlpha = .12 + .07*Math.sin(t*.05)
      this.ln(px+pw, cy, tx-tr*.5, ty, C.accent, 1)
      this.ctx.setLineDash([]); this.ctx.globalAlpha = 1

      // Notifikační tečka
      if (Math.floor(t/40)%2===0) {
        this.disc(px+pw-2, py+10, 5, C.accent)
        this.ctx.globalAlpha=.3; this.disc(px+pw-2, py+10, 9, C.accent); this.ctx.globalAlpha=1
      }
    }

    // ── SCÉNA 2 – Příchod ────────────────────────────────────────────────────
    s2() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.025)

      const gy = h*.85
      this.ln(0, gy, w, gy, C.mid, 1)

      // Budova
      const bx=w*.5, bw=w*.46, bh=h*.72, by=gy-bh
      this.box(bx, by, bw, bh, C.surface)
      this.boxStroke(bx, by, bw, bh, C.mid, 1)
      for (let row=0; row<3; row++) for (let col=0; col<5; col++) {
        const ww=(bw-20)/5-3, wh=bh*.13
        const lit = Math.sin(t*.008+row*1.3+col*.7) > .3
        this.box(bx+10+col*(ww+3), by+12+row*(wh+8), ww, wh, lit ? C.accent+'55' : C.dim, 2)
      }
      const dw=28, dh=36, dx=bx+bw/2-14, dy=gy-dh
      this.box(dx, dy, dw, dh, C.mid, 2)
      this.ctx.fillStyle=C.accent; this.ctx.font='bold 10px Inter,sans-serif'
      this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
      this.ctx.fillText('PA', dx+14, dy-7)

      // Chodící figurka
      const fx = (t * .45) % (w*.78)
      if (fx < bx-10) this.figure(fx, gy, h*.34, C.accent, t*.2)

      // Taška
      if (fx < bx-20) {
        this.box(fx+h*.04, gy-h*.09, h*.07, h*.09, C.mid, 2)
        this.ln(fx+h*.04, gy-h*.09, fx+h*.075, gy-h*.13, C.muted, 1.5)
      }

      // Hodiny
      const clx=w*.14, cly=h*.33, clr=h*.17
      this.disc(clx, cly, clr, C.surface); this.ring(clx, cly, clr, C.mid, 1.5)
      for (let i=0;i<12;i++) {
        const a=i/12*PI*2-PI/2
        this.ctx.strokeStyle=i%3===0?C.muted:C.dim
        this.ctx.lineWidth=i%3===0?1.5:.8
        this.ctx.beginPath(); this.ctx.moveTo(clx+Math.cos(a)*(clr-3), cly+Math.sin(a)*(clr-3))
        this.ctx.lineTo(clx+Math.cos(a)*(clr-(i%3===0?9:6)), cly+Math.sin(a)*(clr-(i%3===0?9:6)))
        this.ctx.stroke()
      }
      const ma = (t*.022)%(PI*2)-PI/2
      this.ctx.strokeStyle=C.accent; this.ctx.lineWidth=2; this.ctx.lineCap='round'
      this.ctx.beginPath(); this.ctx.moveTo(clx,cly); this.ctx.lineTo(clx+Math.cos(ma)*clr*.72, cly+Math.sin(ma)*clr*.72); this.ctx.stroke()
      this.ctx.strokeStyle=C.muted; this.ctx.lineWidth=2.5
      this.ctx.beginPath(); this.ctx.moveTo(clx,cly); this.ctx.lineTo(clx+Math.cos(ma*.083-PI/2)*clr*.48, cly+Math.sin(ma*.083-PI/2)*clr*.48); this.ctx.stroke()
      this.disc(clx, cly, 3, C.accent)
    }

    // ── SCÉNA 3 – Docházková kniha ───────────────────────────────────────────
    s3() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      const bw=w*.54, bh=h*.72, bx=cx-bw/2-w*.03, by=cy-bh/2
      this.box(bx, by, bw, bh, C.surface, 5)
      this.boxStroke(bx, by, bw, bh, C.mid, 1.5, 5)
      this.box(bx, by, 14, bh, C.dim, [5,0,0,5])

      // Řádky linátka
      for (let i=0; i<9; i++) {
        const ly = by+18+i*((bh-28)/9)
        this.ctx.strokeStyle = i%4===0 ? C.mid+'99' : C.dim+'66'
        this.ctx.lineWidth = .5; this.ctx.setLineDash(i%4===0?[]:[2,4])
        this.ctx.beginPath(); this.ctx.moveTo(bx+18, ly); this.ctx.lineTo(bx+bw-8, ly); this.ctx.stroke()
        this.ctx.setLineDash([])
      }

      // Animované psaní řádků
      const CYCLE = 200, phase = t % CYCLE
      for (let i=0; i<4; i++) {
        const start = i*46, prog = clamp((phase-start)/40, 0, 1)
        if (prog <= 0) continue
        const ly = by+24+i*((bh-28)/9)
        const maxLen = (bw-28)*[.65,.88,.5,.78][i]
        this.ctx.strokeStyle = C.accent; this.ctx.lineWidth = 1.8; this.ctx.lineCap = 'round'
        this.ctx.beginPath(); this.ctx.moveTo(bx+18, ly); this.ctx.lineTo(bx+18+maxLen*ease(prog), ly); this.ctx.stroke()
        if (prog>=1) this.disc(bx+18+maxLen, ly, 2.5, C.accent)
      }

      // Pero
      const lineIdx = Math.min(3, Math.floor(phase/46))
      const lineProg = clamp((phase-lineIdx*46)/40, 0, 1)
      const penTipX = bx+18+(bw-28)*[.65,.88,.5,.78][lineIdx]*ease(lineProg)
      const penTipY = by+24+lineIdx*((bh-28)/9)
      const pAngle = -PI*.32, pLen = h*.3
      const pex = penTipX+Math.cos(pAngle+PI)*pLen, pey = penTipY+Math.sin(pAngle+PI)*pLen
      this.ctx.strokeStyle=C.accent; this.ctx.lineWidth=5; this.ctx.lineCap='round'
      this.ctx.beginPath(); this.ctx.moveTo(penTipX, penTipY); this.ctx.lineTo(pex, pey); this.ctx.stroke()
      this.ctx.strokeStyle='#1a1a1a'; this.ctx.lineWidth=3
      this.ctx.beginPath()
      this.ctx.moveTo(penTipX+Math.cos(pAngle+PI)*9, penTipY+Math.sin(pAngle+PI)*9)
      this.ctx.lineTo(pex-Math.cos(pAngle+PI)*14, pey-Math.sin(pAngle+PI)*14)
      this.ctx.stroke()
      this.disc(penTipX, penTipY, 2, '#fff')
    }

    // ── SCÉNA 4 – Odevzdání telefonu ─────────────────────────────────────────
    s4() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      const cycleLen = 200, phase = ease(clamp((t%cycleLen)/cycleLen*1.6-.3, 0, 1))
      const lhx = cx-w*.28, rhx = cx+w*.28, hy = cy+h*.06

      // Levá ruka (dávající)
      this.ctx.globalAlpha = 1 - phase*.25
      this._hand(lhx, hy, h*.22, C.muted, true)
      this.ctx.globalAlpha = 1

      // Pravá ruka (přijímající)
      this.ctx.globalAlpha = .35 + phase*.65
      this._hand(rhx, hy, h*.22, C.accent, false)
      this.ctx.globalAlpha = 1

      // Telefon v pohybu
      const phoneX = lerp(lhx+w*.05, rhx-w*.05, phase)
      const phoneY = hy - h*.09 - Math.sin(phase*PI)*h*.06
      const phoneW = w*.1, phoneH = h*.56
      this.ctx.save(); this.ctx.translate(phoneX, phoneY); this.ctx.rotate(Math.sin(phase*PI)*.18)
      this.box(-phoneW/2, -phoneH/2, phoneW, phoneH, C.surface, 7)
      this.boxStroke(-phoneW/2, -phoneH/2, phoneW, phoneH, C.mid, 1.5, 7)
      this.box(-phoneW/2+3, -phoneH/2+6, phoneW-6, phoneH-12, '#111', 5)
      this.ctx.globalAlpha=.5; this.disc(0, -phoneH*.12, phoneW*.24, C.accent); this.ctx.globalAlpha=1
      this.ctx.restore()

      // Oblouková trajektorie
      this.ctx.setLineDash([4,6]); this.ctx.strokeStyle=C.accent+'2a'; this.ctx.lineWidth=1.5
      this.ctx.beginPath(); this.ctx.moveTo(lhx+w*.05, hy-h*.09)
      this.ctx.quadraticCurveTo(cx, hy-h*.24, rhx-w*.05, hy-h*.09); this.ctx.stroke()
      this.ctx.setLineDash([])

      // Jiskra při předání
      if (phase>.38 && phase<.62) {
        const sa = Math.sin((phase-.38)/.24*PI)
        this.ctx.globalAlpha = sa*.5
        this.disc(cx, hy-h*.19, h*.05, C.accent+'aa')
        this.ctx.globalAlpha = 1
      }
    }

    _hand(x, y, size, col, right) {
      const s = size, fw = s*.18, gap = s*.03, palmW = s*.65, palmH = s*.4
      const px = x-palmW/2, py = y-palmH*.3
      this.box(px, py, palmW, palmH, col, 6)
      const heights=[.7,.85,.8,.65]
      for (let i=0;i<4;i++) this.box(px+i*(fw+gap)+gap, py-s*.48*heights[i]+4, fw, s*.48*heights[i], col, fw/2)
      const tx = right ? px-fw*.8 : px+palmW
      this.box(tx, py+palmH*.2, fw*.85, s*.35, col, fw*.4)
    }

    // ── SCÉNA 5 – Zóny ───────────────────────────────────────────────────────
    s5() {
      const { w, h, cx, cy, t } = this
      this.bg()

      const zones = [
        { x:.07, y:.12, w:.36, h:.58, col:C.accent,  lbl:'ARENA' },
        { x:.47, y:.12, w:.24, h:.58, col:C.blue,    lbl:'STREAM' },
        { x:.74, y:.12, w:.2,  h:.26, col:C.green,   lbl:'OFFICE' },
        { x:.74, y:.42, w:.2,  h:.28, col:'#9B59B6', lbl:'CHILL' },
      ]
      zones.forEach((z, i) => {
        const p = .05 + .04*Math.sin(t*.04+i*1.4)
        this.ctx.globalAlpha = p
        this.box(z.x*w, z.y*h, z.w*w, z.h*h, z.col)
        this.ctx.globalAlpha = 1
        this.boxStroke(z.x*w, z.y*h, z.w*w, z.h*h, z.col+'99', 1)
        this.ctx.fillStyle = z.col+'55'; this.ctx.font=`bold ${h*.035}px Inter,sans-serif`
        this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
        this.ctx.fillText(z.lbl, (z.x+z.w/2)*w, (z.y+z.h/2)*h)
      })

      // Figurka prochází zónami
      const fx = w*.07 + ((t*.35)%(w*.85))
      this.figure(fx, h*.82, h*.3, C.accent, t*.2)

      // Kamera ve stream zóně
      const camX=w*.595, camY=h*.41
      this.ctx.save(); this.ctx.translate(camX,camY); this.ctx.rotate(Math.sin(t*.02)*.15)
      this.box(-16,-10,32,20,C.blue+'88',3); this.disc(0,0,9,C.blue); this.disc(0,0,4,'#001')
      this.box(8,-14,8,8,C.blue+'88',2)
      this.ctx.restore()

      // Červené ohraničení zakázané zóny
      this.ctx.globalAlpha=.25+.15*Math.abs(Math.sin(t*.08))
      this.boxStroke(w*.07, h*.12, w*.36, h*.58, C.red, 2)
      this.ctx.globalAlpha=1
    }

    // ── SCÉNA 6 – Rozcvičení ─────────────────────────────────────────────────
    s6() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.02)

      // Energetické částice
      for (let i=0;i<8;i++) {
        const a=(i/8*PI*2)+t*.01, r=h*.24+h*.07*Math.sin(t*.05+i)
        this.ctx.globalAlpha=.12+.08*Math.sin(t*.07+i)
        this.disc(cx+Math.cos(a)*r, cy+Math.sin(a)*r, 3, C.accent)
        this.ctx.globalAlpha=1
      }

      const posLen=65, pIdx=Math.floor(t/posLen)%4, pT=(t%posLen)/posLen
      const fx=cx, fy=cy+h*.25, fs=h*.56
      const c=this.ctx

      c.strokeStyle=C.accent; c.fillStyle=C.accent
      c.lineWidth=fs*.065; c.lineCap='round'
      c.beginPath(); c.arc(fx, fy-fs*.73, fs*.12, 0, PI*2); c.fill()
      c.beginPath(); c.moveTo(fx,fy-fs*.58); c.lineTo(fx,fy-fs*.22); c.stroke()

      let al, ar, bl, br
      const e=ease(pT)
      if (pIdx===0) { // ruce nahoru
        al=[fx-fs*.26, fy-fs*lerp(.52,.86,e)]; ar=[fx+fs*.26, fy-fs*lerp(.52,.86,e)]
        bl=[fx-fs*.12, fy]; br=[fx+fs*.12, fy]
      } else if (pIdx===1) { // dotyk špiček
        al=[fx-fs*.28, fy-fs*lerp(.48,-.08,e)]; ar=[fx+fs*.28, fy-fs*lerp(.48,-.08,e)]
        bl=[fx-fs*.12, fy]; br=[fx+fs*.12, fy]
      } else if (pIdx===2) { // výskoky
        const s=ease(Math.abs(Math.sin(t*.09)))
        al=[fx-fs*.42*s, fy-fs*(.5+.32*s)]; ar=[fx+fs*.42*s, fy-fs*(.5+.32*s)]
        bl=[fx-fs*.26*s, fy+fs*.03*s]; br=[fx+fs*.26*s, fy+fs*.03*s]
      } else { // výpad do strany
        al=[fx-fs*.3, fy-fs*.5]; ar=[fx+fs*.32*e, fy-fs*.46]
        bl=[fx-fs*.38*e, fy+fs*.12*e]; br=[fx+fs*.1, fy]
      }
      c.beginPath(); c.moveTo(fx,fy-fs*.5); c.lineTo(...al); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.5); c.lineTo(...ar); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.22); c.lineTo(...bl); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.22); c.lineTo(...br); c.stroke()
    }

    // ── SCÉNA 7 – Výstroj ────────────────────────────────────────────────────
    s7() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      // Dres sjíždí shora
      const jw=w*.21, jh=h*.64, jx=cx-jw/2-w*.14, jy=cy-jh/2+h*.04
      const jT=clamp(t/45, 0, 1), jOff=h*(1-ease(jT))
      const c=this.ctx

      c.save(); c.translate(0, -jOff)
      c.fillStyle=C.surface; c.strokeStyle=C.accent; c.lineWidth=2; c.lineCap='round'
      c.beginPath()
      c.moveTo(jx+jw*.2, jy); c.lineTo(jx, jy+jh*.15); c.lineTo(jx, jy+jh)
      c.lineTo(jx+jw, jy+jh); c.lineTo(jx+jw, jy+jh*.15); c.lineTo(jx+jw*.8, jy)
      c.closePath(); c.fill(); c.stroke()
      // Rukávy
      ;[[-1, jx, jy+jh*.15], [1, jx+jw, jy+jh*.15]].forEach(([dir, ox, oy]) => {
        c.beginPath()
        c.moveTo(ox, oy)
        c.lineTo(ox+dir*jw*.28, oy+jh*.26); c.lineTo(ox+dir*jw*.16, oy+jh*.35)
        c.lineTo(ox+dir*(-jw*.05), oy+jh*.24); c.closePath(); c.fill(); c.stroke()
      })
      if (jT>=1) {
        c.fillStyle=C.accent; c.font=`bold ${jh*.24}px "Bebas Neue",Inter,sans-serif`
        c.textAlign='center'; c.textBaseline='middle'; c.fillText('1', jx+jw/2, jy+jh*.62)
      }
      c.restore()

      // Rukavice přijíždí zprava
      const gT=clamp((t-28)/55, 0, 1), gOff=w*(1-ease(gT))
      c.save(); c.translate(gOff, 0)
      const gx=cx+w*.1, gy=cy-h*.06
      ;[-1, 1].forEach(side => {
        const ox = gx + side*w*.08
        // Dlaň
        c.fillStyle=C.accent+'dd'; c.strokeStyle=C.accent; c.lineWidth=1.5
        c.beginPath(); c.roundRect(ox-w*.06, gy-h*.35, w*.12, h*.44, [7,7,3,3]); c.fill(); c.stroke()
        // Zápěstní páska
        c.fillStyle=C.dim; c.strokeStyle=C.accent; c.lineWidth=1
        c.beginPath(); c.roundRect(ox-w*.06, gy+h*.1, w*.12, h*.16, 3); c.fill(); c.stroke()
        // Prsty
        for (let f=0;f<4;f++) {
          const fw=w*.022, fx=ox-w*.045+f*(fw+2)
          c.fillStyle=C.accent+'dd'; c.beginPath()
          c.roundRect(fx, gy-h*.58, fw, h*.28, [fw/2,fw/2,1,1]); c.fill(); c.stroke()
        }
      })
      c.restore()
    }

    // ── SCÉNA 8 – Kontrola FireBall ───────────────────────────────────────────
    s8() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.03)

      const mx=cx+w*.08, my=cy-h*.08, mw=w*.28, mh=h*.55
      const c=this.ctx

      // Stroj
      c.fillStyle=C.surface; c.strokeStyle=C.mid; c.lineWidth=1.5
      c.beginPath()
      c.moveTo(mx-mw*.52, my-mh*.22); c.lineTo(mx+mw*.52, my-mh*.22)
      c.lineTo(mx+mw*.27, my); c.lineTo(mx-mw*.27, my); c.closePath(); c.fill(); c.stroke()
      c.beginPath(); c.roundRect(mx-mw*.3, my, mw*.6, mh*.52, [0,0,8,8]); c.fill(); c.stroke()
      this.ring(mx, my+mh*.52, mh*.065, C.mid, 1.5)
      c.fillStyle=C.accent; c.font=`bold ${mh*.07}px "Bebas Neue",Inter,sans-serif`
      c.textAlign='center'; c.textBaseline='middle'; c.fillText('PA', mx, my+mh*.26)

      // Míče
      const TOTAL=21, ballsNow=Math.min(TOTAL, Math.floor(t/7))
      const br=Math.min(mw*.042, h*.032)
      let shown=0
      outer: for (let row=4; row>=0; row--) {
        for (let col=0; col<5; col++) {
          if (shown>=ballsNow) break outer
          const bx=mx-mw*.2+col*(br*2.3)
          const by=my-mh*.13-row*(br*2.3)
          this.disc(bx, by, br, C.accent)
          c.fillStyle='#00000033'; c.beginPath(); c.arc(bx-1,by-1,br*.5,0,PI*2); c.fill()
          shown++
        }
      }

      // Počítadlo vlevo
      const cntX=cx-w*.27, cntY=cy
      c.fillStyle=C.muted; c.font=`${h*.045}px Inter,sans-serif`
      c.textAlign='center'; c.textBaseline='middle'
      c.fillText('míče', cntX, cntY-h*.1)
      c.fillStyle=C.accent; c.font=`bold ${h*.26}px "Bebas Neue",Inter,sans-serif`
      c.fillText(Math.min(TOTAL, ballsNow), cntX, cntY+h*.07)

      // Fajfka po dosažení 21
      if (ballsNow>=TOTAL) {
        const ck=.4+.3*Math.abs(Math.sin(t*.04))
        c.globalAlpha=ck; c.strokeStyle=C.green; c.lineWidth=3.5; c.lineCap='round'; c.lineJoin='round'
        c.beginPath(); c.moveTo(cntX-14, cntY+h*.24); c.lineTo(cntX, cntY+h*.24+12); c.lineTo(cntX+22, cntY+h*.24-12); c.stroke()
        c.globalAlpha=1
      }
      if (t > TOTAL*7+120) this.t=0
    }

    // ── SCÉNA 9 – Průběh session ──────────────────────────────────────────────
    s9() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.02)

      // Branka – síť
      const nx=w*.1, ny=h*.07, nw=w*.8, nh=h*.68
      const c=this.ctx
      c.strokeStyle='#ccc'; c.lineWidth=3; c.lineCap='square'
      c.beginPath(); c.moveTo(nx,ny+nh); c.lineTo(nx,ny); c.lineTo(nx+nw,ny); c.lineTo(nx+nw,ny+nh); c.stroke()
      c.strokeStyle=C.mid; c.lineWidth=.5
      for (let x=nx;x<=nx+nw;x+=22) { c.beginPath(); c.moveTo(x,ny); c.lineTo(x+5,ny+nh); c.stroke() }
      for (let y=ny;y<=ny+nh;y+=22) { c.beginPath(); c.moveTo(nx,y); c.lineTo(nx+nw,y+3); c.stroke() }

      // Trávník
      c.strokeStyle='#1e4d28'; c.lineWidth=1.5
      c.beginPath(); c.moveTo(0,h*.84); c.lineTo(w,h*.84); c.stroke()
      this.disc(cx, h*.84, 4, '#2a6632')

      // Cyklus: míč lítá → brankář skočí
      const cycLen=130, phase=(t%cycLen)/cycLen
      if (phase<.55) {
        const bp=ease(phase/.55), bx=lerp(cx, nx+nw*.78, bp), by=lerp(h*.84, ny+nh*.22, bp)
        // Stopa
        for (let tr=1;tr<=3;tr++) {
          const tp=clamp(bp-tr*.06,0,1)
          c.globalAlpha=(4-tr)*.07; this.disc(lerp(cx,nx+nw*.78,tp), lerp(h*.84,ny+nh*.22,tp), 7-tr, '#fff'); c.globalAlpha=1
        }
        this.disc(bx, by, 8, '#fff')
      }

      // Brankář skáče
      const dp=ease(clamp((phase-.1)*2.2,0,1))
      const gkX=nx+nw*.62+nw*.28*dp, gkY=ny+nh*.62-nh*.4*Math.sin(dp*PI), gkA=dp*.9-.2
      c.save(); c.translate(gkX, gkY); c.rotate(gkA)
      c.strokeStyle=C.accent; c.fillStyle=C.accent; c.lineWidth=h*.058; c.lineCap='round'
      c.beginPath(); c.arc(-h*.32,0,h*.065,0,PI*2); c.fill()
      c.beginPath(); c.moveTo(-h*.25,0); c.lineTo(-h*.02,0); c.stroke()
      c.beginPath(); c.moveTo(-h*.1,0); c.lineTo(h*.14,-h*.1); c.stroke()
      c.beginPath(); c.moveTo(0,0); c.lineTo(h*.12,h*.1); c.stroke()
      c.beginPath(); c.moveTo(h*.05,0); c.lineTo(h*.16,-h*.09); c.stroke()
      c.restore()

      if (phase>.58&&phase<.78) {
        const sa=Math.sin((phase-.58)/.2*PI)
        c.globalAlpha=sa; c.fillStyle=C.accent
        c.font=`bold ${h*.11}px "Bebas Neue",Inter,sans-serif`
        c.textAlign='center'; c.textBaseline='middle'; c.fillText('SAVE!', cx, h*.42)
        c.globalAlpha=1
      }
    }

    // ── SCÉNA 10 – Respektuj tým ─────────────────────────────────────────────
    s10() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      const cycLen=170, eA=ease(clamp((t%cycLen)/85, 0, 1))
      const lx=lerp(cx-w*.44, cx-w*.18, eA), rx=lerp(cx+w*.44, cx+w*.18, eA), gy=cy+h*.22

      this.figure(lx, gy, h*.44, C.muted, eA>.9?0:t*.2)
      this.figure(rx, gy, h*.44, C.accent, eA>.9?0:-t*.2)

      if (eA>.55) {
        const sa=clamp((eA-.55)/.45,0,1)
        this.ctx.globalAlpha=sa
        this.ctx.globalAlpha=sa*(.12+.08*Math.abs(Math.sin(t*.1)))
        this.disc(cx, gy-h*.16, h*.09, C.accent)
        this.ctx.globalAlpha=sa
        // Spojovací jiskry
        for (let i=0;i<6;i++) {
          const a=(i/6*PI*2)+t*.08, r=h*.13+h*.04*Math.sin(t*.12+i)
          this.disc(cx+Math.cos(a)*r, gy-h*.16+Math.sin(a)*r*.5, 2.5, C.accent)
        }
        // Čáry spojení
        this.ctx.strokeStyle=C.accent; this.ctx.lineWidth=1.5; this.ctx.setLineDash([3,5])
        this.ctx.beginPath(); this.ctx.moveTo(lx,gy-h*.38); this.ctx.lineTo(cx, gy-h*.22)
        this.ctx.moveTo(rx,gy-h*.38); this.ctx.lineTo(cx, gy-h*.22); this.ctx.stroke()
        this.ctx.setLineDash([])
        this.ctx.globalAlpha=1
      }

      this.ctx.fillStyle=C.dim+'88'; this.ctx.font=`${h*.04}px Inter,sans-serif`
      this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
      this.ctx.fillText('ROZHODČÍ', lx, gy+h*.12)
      this.ctx.fillText('BRANKÁŘ', rx, gy+h*.12)
    }

    // ── SCÉNA 11 – Pauza ─────────────────────────────────────────────────────
    s11() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.025)

      // Pohovka
      const sw=w*.42, sh=h*.3, sx=cx-sw/2+w*.06, sy=cy+h*.02
      this.box(sx-sh*.15, sy-sh*.3, sh*.17, sh*.9, C.surface, 4)
      this.box(sx+sw-sh*.02, sy-sh*.3, sh*.17, sh*.9, C.surface, 4)
      this.box(sx, sy-sh*.5, sw, sh*.55, C.surface, [8,8,0,0])
      this.boxStroke(sx, sy-sh*.5, sw, sh*.55, C.mid, 1, [8,8,0,0])
      this.box(sx, sy, sw, sh*.68, C.s2||'#1a1a1a', [0,0,8,8])
      this.boxStroke(sx, sy, sw, sh*.68, C.mid, 1, [0,0,8,8])
      // Polštáře
      ;[sx+5, sx+sw/2+2].forEach(px => this.box(px, sy+4, sw*.46, sh*.52, C.surface+'88', 6))

      // Figurka na pohovce
      const fx=cx+w*.05, fy=sy-sh*.05
      const c=this.ctx
      c.fillStyle=C.accent; c.strokeStyle=C.accent; c.lineWidth=h*.052; c.lineCap='round'
      c.beginPath(); c.arc(fx,fy-h*.32,h*.07,0,PI*2); c.fill()
      c.beginPath(); c.moveTo(fx,fy-h*.24); c.lineTo(fx-h*.04,fy); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-h*.18); c.lineTo(fx+h*.18,fy-h*.08); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-h*.18); c.lineTo(fx-h*.1,fy-h*.08); c.stroke()
      c.beginPath(); c.moveTo(fx-h*.04,fy); c.lineTo(fx+h*.14,fy); c.stroke()

      // Ovladač
      const crX=fx+h*.22, crY=fy-h*.05
      this.box(crX-14, crY-8, 28, 16, C.dim, 8); this.boxStroke(crX-14, crY-8, 28, 16, C.muted, 1, 8)
      this.disc(crX+5,crY-2,3,C.accent); this.disc(crX-5,crY+2,3,C.muted)

      // Zzz
      for (let i=0;i<3;i++) {
        const zp=((t*.45+i*26)%80)/80
        c.globalAlpha=clamp(.85-zp,0,1); c.fillStyle=C.dim
        c.font=`${11+i*3}px Inter,sans-serif`; c.textAlign='center'; c.textBaseline='middle'
        c.fillText('z', fx-h*.04+i*5-5, fy-h*.38-zp*h*.28)
        c.globalAlpha=1
      }

      // Terčík na šipky
      const dx=w*.13, dy=cy-h*.12, dr=h*.19
      ;[C.red,'#fff',C.red,'#fff',C.green,C.red].forEach((col,i) =>
        this.disc(dx, dy, dr*[1,.75,.55,.35,.15,.06][i], col))
      // Šipka
      c.strokeStyle=C.accent; c.lineWidth=1.5; c.lineCap='round'
      const da=PI*.42+Math.sin(t*.018)*.25
      c.beginPath(); c.moveTo(dx+Math.cos(da)*dr*.1,dy+Math.sin(da)*dr*.1)
      c.lineTo(dx+Math.cos(da)*dr*1.1,dy+Math.sin(da)*dr*1.1); c.stroke()
      this.disc(dx+Math.cos(da)*dr*.1, dy+Math.sin(da)*dr*.1, 3, C.accent)
    }

    // ── SCÉNA 12 – Chraň vybavení ────────────────────────────────────────────
    s12() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.02)

      // Kamera
      const cw=w*.28, chh=h*.42, c2x=cx-cw*.08, c2y=cy-chh*.18
      this.box(c2x-cw/2, c2y-chh/2, cw, chh, C.surface, 8)
      this.boxStroke(c2x-cw/2, c2y-chh/2, cw, chh, C.mid, 1.5, 8)
      const lr=h*.14
      this.disc(c2x+cw*.32, c2y, lr*1.3, C.dim); this.disc(c2x+cw*.32, c2y, lr, '#111')
      this.ring(c2x+cw*.32, c2y, lr, C.mid, 2); this.disc(c2x+cw*.32, c2y, lr*.65, '#080808')
      this.ring(c2x+cw*.32, c2y, lr*.65, C.muted, 1)
      this.ctx.globalAlpha=.25; this.disc(c2x+cw*.32-lr*.25, c2y-lr*.25, lr*.2, '#fff'); this.ctx.globalAlpha=1
      this.box(c2x+cw*.1, c2y-chh/2-h*.09, cw*.24, h*.1, C.dim, 3)
      this.ctx.fillStyle=C.accent; this.ctx.font=`bold ${h*.05}px Inter,sans-serif`
      this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
      this.ctx.fillText('PA', c2x-cw*.15, c2y)

      // Ochranný štít
      for (let i=3;i>=1;i--) {
        const pulse=.5+.5*Math.sin(t*.04+i*.5)
        this.ctx.globalAlpha=(.1-i*.02)*pulse
        this.disc(cx, c2y, h*(.26+i*.07)+pulse*h*.03, C.accent)
        this.ctx.globalAlpha=1
      }
      this.ctx.globalAlpha=.12+.08*Math.sin(t*.04)
      this.ring(cx, c2y, h*.48, C.accent, 1.5)
      this.ctx.globalAlpha=1

      // Plovoucí objekty
      ;['⚽','🎥','🔌'].forEach((icon, i) => {
        const a = [-PI*.3, PI*.3, PI*.85][i] + t*.005
        const r=h*.37+h*.04*Math.sin(t*.03+i)
        this.ctx.font=`${h*.09}px serif`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
        this.ctx.fillText(icon, cx+Math.cos(a)*r, c2y+Math.sin(a)*r*.6)
      })
    }

    // ── SCÉNA 13 – Konec směny ───────────────────────────────────────────────
    s13() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid()

      const cr=h*.3, clx=cx-w*.15, cly=cy-h*.04
      this.disc(clx, cly, cr, C.surface); this.ring(clx, cly, cr, C.mid, 2)
      this.ring(clx, cly, cr*.84, C.dim, .8)
      for (let i=0;i<12;i++) {
        const a=i/12*PI*2-PI/2
        this.ctx.strokeStyle=i%3===0?C.muted:C.dim; this.ctx.lineWidth=i%3===0?2:1
        this.ctx.beginPath(); this.ctx.moveTo(clx+Math.cos(a)*(cr-3),cly+Math.sin(a)*(cr-3))
        this.ctx.lineTo(clx+Math.cos(a)*(cr-(i%3===0?12:6)),cly+Math.sin(a)*(cr-(i%3===0?12:6))); this.ctx.stroke()
      }
      const ma=(t*.024)%(PI*2)-PI/2
      const ha=lerp(-PI*.5, PI*.5, ease(Math.min(1,t/100)))
      this.ctx.lineCap='round'
      this.ctx.strokeStyle=C.muted; this.ctx.lineWidth=3
      this.ctx.beginPath(); this.ctx.moveTo(clx,cly); this.ctx.lineTo(clx+Math.cos(ha)*cr*.54,cly+Math.sin(ha)*cr*.54); this.ctx.stroke()
      this.ctx.strokeStyle=C.accent; this.ctx.lineWidth=2
      this.ctx.beginPath(); this.ctx.moveTo(clx,cly); this.ctx.lineTo(clx+Math.cos(ma)*cr*.75,cly+Math.sin(ma)*cr*.75); this.ctx.stroke()
      this.disc(clx, cly, 4, C.accent)

      // Koště
      const bx=cx+w*.2, by=cy+h*.28, ba=PI*.38+Math.sin(t*.04)*.08, bLen=h*.52
      this.ctx.strokeStyle=C.muted; this.ctx.lineWidth=3; this.ctx.lineCap='round'
      this.ctx.beginPath(); this.ctx.moveTo(bx,by); this.ctx.lineTo(bx+Math.cos(ba+PI)*bLen, by+Math.sin(ba+PI)*bLen); this.ctx.stroke()
      const bhx=bx+Math.cos(ba+PI)*bLen, bhy=by+Math.sin(ba+PI)*bLen
      this.ctx.save(); this.ctx.translate(bhx,bhy); this.ctx.rotate(ba+PI*.5)
      this.box(-20,0,40,14,C.dim,3); this.boxStroke(-20,0,40,14,C.muted,1.5,3); this.ctx.restore()

      // Fajfka
      const ckT=ease(clamp((t-85)/45,0,1))
      if (ckT>0) {
        const p1=[cx+w*.18, cy-h*.22], p2=[cx+w*.26, cy-h*.1], p3=[cx+w*.4, cy-h*.3]
        this.ctx.save(); this.ctx.globalAlpha=ckT
        this.ctx.strokeStyle=C.green; this.ctx.lineWidth=4; this.ctx.lineCap='round'; this.ctx.lineJoin='round'
        this.ctx.beginPath()
        if (ckT<.5) {
          const p=ckT*2
          this.ctx.moveTo(...p1); this.ctx.lineTo(lerp(p1[0],p2[0],p), lerp(p1[1],p2[1],p))
        } else {
          this.ctx.moveTo(...p1); this.ctx.lineTo(...p2)
          const p=(ckT-.5)*2
          this.ctx.moveTo(...p2); this.ctx.lineTo(lerp(p2[0],p3[0],p), lerp(p2[1],p3[1],p))
        }
        this.ctx.stroke(); this.ctx.restore()
      }
    }

    // ── SCÉNA 14 – Zakázané činnosti ─────────────────────────────────────────
    s14() {
      const { w, h, t } = this
      this.bg(); this.grid(.025)

      const icons = ['📱','🍔','🍺','🚬','😤','🔒']
      const cols=3, rows=2, cw=w/cols, ch=h/rows

      icons.forEach((icon, i) => {
        const col=i%cols, row=Math.floor(i/cols)
        const px=cw*col+cw/2, py=ch*row+ch/2
        const pulse=.82+.18*Math.abs(Math.sin(t*.04+i*.9))
        const r=Math.min(cw,ch)*.3*pulse

        this.ctx.save(); this.ctx.translate(px, py)
        this.ctx.globalAlpha=.1; this.disc(0,0,r,C.red); this.ctx.globalAlpha=1
        this.ctx.font=`${r*.88}px serif`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'
        this.ctx.globalAlpha=.55; this.ctx.fillText(icon,0,0); this.ctx.globalAlpha=1
        this.ctx.strokeStyle=C.red; this.ctx.lineWidth=3
        this.ctx.beginPath(); this.ctx.arc(0,0,r,0,PI*2); this.ctx.stroke()
        this.ctx.beginPath()
        this.ctx.moveTo(-r*Math.cos(PI*.2),-r*Math.sin(PI*.2))
        this.ctx.lineTo( r*Math.cos(PI*.2), r*Math.sin(PI*.2))
        this.ctx.stroke()
        this.ctx.restore()
      })
    }

    // ── SCÉNA 15 – Závěr ─────────────────────────────────────────────────────
    s15() {
      const { w, h, cx, cy, t } = this
      this.bg(); this.grid(.02)

      // Branka
      const nx=w*.1, ny=h*.06, nw=w*.8, nh=h*.7
      const c=this.ctx
      c.strokeStyle='#555'; c.lineWidth=2.5; c.lineCap='square'
      c.beginPath(); c.moveTo(nx,ny+nh); c.lineTo(nx,ny); c.lineTo(nx+nw,ny); c.lineTo(nx+nw,ny+nh); c.stroke()
      c.strokeStyle=C.dim; c.lineWidth=.5
      for (let x=nx;x<=nx+nw;x+=20) { c.beginPath(); c.moveTo(x,ny); c.lineTo(x+4,ny+nh); c.stroke() }
      for (let y=ny;y<=ny+nh;y+=20) { c.beginPath(); c.moveTo(nx,y); c.lineTo(nx+nw,y+2); c.stroke() }
      c.strokeStyle=C.mid; c.lineWidth=1
      c.beginPath(); c.moveTo(0,h*.85); c.lineTo(w,h*.85); c.stroke()

      // Figurka s roztaženýma rukama
      const fx=cx, fy=h*.83, fs=h*.58
      const spread=.72+.28*Math.sin(t*.04)
      c.fillStyle=C.accent; c.strokeStyle=C.accent; c.lineWidth=fs*.068; c.lineCap='round'
      c.beginPath(); c.arc(fx, fy-fs*.73, fs*.12, 0, PI*2); c.fill()
      c.beginPath(); c.moveTo(fx,fy-fs*.58); c.lineTo(fx,fy-fs*.22); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.5); c.lineTo(fx-fs*.52*spread, fy-fs*.44+fs*.1*(1-spread)); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.5); c.lineTo(fx+fs*.52*spread, fy-fs*.44+fs*.1*(1-spread)); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.22); c.lineTo(fx-fs*.11,fy); c.stroke()
      c.beginPath(); c.moveTo(fx,fy-fs*.22); c.lineTo(fx+fs*.11,fy); c.stroke()

      // Hvězdy / jiskry
      for (let i=0;i<14;i++) {
        const a=(i/14*PI*2)+t*.02, r=fs*(.62+.16*Math.sin(t*.06+i))
        const sx=fx+Math.cos(a)*r, sy=fy-fs*.44+Math.sin(a)*r*.5
        c.globalAlpha=.28+.4*Math.abs(Math.sin(t*.08+i*1.4))
        this.disc(sx, sy, 2.5+2*Math.abs(Math.sin(t*.1+i)), C.accent)
        c.globalAlpha=1
      }

      // Záře pod figurkou
      c.globalAlpha=.06+.04*Math.sin(t*.04)
      this.disc(fx, fy-fs*.38, fs*.72, C.accent)
      c.globalAlpha=1
    }
  }

  // ── Inicializace ─────────────────────────────────────────────────────────
  document.querySelectorAll('.scene-anim[data-anim]').forEach(el => {
    new SceneAnim(el, +el.dataset.anim)
  })

})()
