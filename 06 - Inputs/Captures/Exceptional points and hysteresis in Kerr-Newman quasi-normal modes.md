---
file_class: capture
paras:
type: "[[Resources]]"
subtypes:
  - "[[External Knowledge - Resources - paper|paper]]"
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-26 08:07
url: 
author:
  - "[[Mario Misas Arcos]]"
  - "[[Alberto T. P´erez]]"
  - "[[Carlos F. Sopuerta]]"
platform: 
---
# [[Exceptional points and hysteresis in Kerr-Newman quasi-normal modes]]

> [!abstract] Paper
> - Kerr-Newman black holes exhibit exceptional points and eigenstate hysteresis from intrinsic gravito-electromagnetic coupling.
> - Four topological branch-point singularities appear near 99.974% extremality, causing modes to exchange identities during adiabatic cycles.
> - Black hole spectroscopy links directly to non-Hermitian spectral topology through observed eigenvalue repulsion and Wigner-Teller effects.

Exceptional points and hysteresis in Kerr-Newman quasi-normal modes
Mario Misas Arcos,1, ∗ Alberto T. P´erez,1, † and Carlos F. Sopuerta2, 3, ‡
1Departamento de Electr´onica y Electromagnetismo,
Universidad de Sevilla, Facultad de F´ısica, 41012 Sevilla, Spain
2Institut de Ci`encies de l’Espai (ICE, CSIC), Campus UAB,
Carrer de Can Magrans s/n, 08193 Cerdanyola del Vall`es, Spain
3Institut d’Estudis Espacials de Catalunya (IEEC), Edifici RDIT,
C/ Esteve Terradas, 1, desp. 212, Castelldefels 08860, Spain
(Dated: October 22, 2026)
Exceptional points (EPs) and eigenstate hysteresis, previously found in Kerr only with an auxil-
iary scalar field, arise intrinsically in the quasinormal-mode spectrum of Kerr-Newman black holes.
Using a hyperboloidal formulation of the coupled gravito-electromagnetic Teukolsky equations and
a Chebyshev pseudospectral method, we compute the ℓ= m = 2 spectrum and locate four EPs at
up to 99.974% of extremality, one from a new repulsion. The gaps close as a square root branch
point, and quasistatic loops around one or more EPs exchange the coalescing modes, confirming
hysteresis.
Introduction. A black hole (BH), as described by gen-
eral relativity (GR), is a region of spacetime from which
nothing can ever escape to reach very distant observers.
As such, BHs are purely geometry objects characterized
by only three parameters as shown by the no-hair theo-
rems [1–4] (see also [5])1: mass M, spin J/M= a, and
electric charge Q; with 0 ≤a,Q ≤M and a2 + Q2 <
M2. A perturbed isolated BH relaxes through a dis-
crete spectrum of damped sinusoids, its quasi-normal
modes (QNMs), with frequencies fixed by M, a, and Q
alone [6–10]. QNMs dominate the post-merger ringdown,
and they have been already identified in LIGO-Virgo-
KAGRA events as GW150914 [11, 12] and GW250114,
the loudest event observed to date, yielding the most
stringent single-event test of the Kerr hypothesis so
far [13]. Because two or more resolved modes overdeter-
mine the remnant’s parameters, any inconsistency among
them signals a departure from GR or from the Kerr so-
lution itself: this is the program of BH spectroscopy [14–
16].
The Kerr-Newman (KN) metric [17, 18], the unique
stationary electrovacuum BH solution, reduces to
Kerr [19] at Q = 0 with extremality reached at M2 =
a2 + Q2 [20]. The event horizon radius is given by r+ =
M+ M2
−a2
−Q2. Like Kerr, KN is an algebraically-
special (Petrov type D) spacetime. Astrophysical BHs
are expected to be essentially neutral [21], yet KN re-
mains the natural arena for intrinsically coupled gravito-
electromagnetic perturbations, and hence for the multi-
field spectral phenomena we report in this letter.
Linear perturbations of spinning BHs are most nat-
urally studied in the Newman-Penrose formalism [22],
where Teukolsky showed that the curvature and Maxwell
∗Contact author: mmisas@us.es
†Contact author: alberto@us.es
‡Contact author: carlos.f.sopuerta@csic.es
1 Throughout this work, we use natural units in which c = G = 1 .
scalars (Ψ0,Ψ4,Φ0,Φ2) obey decoupled, separable mas-
ter equations on a Kerr background [23] (see also [20]).
For a KN BH background, while the Klein-Gordon and
Dirac equations are separable [10], it has not until very
recently that the gravito-electromagnetic perturbations
have been separated although not fully decoupled [24]
(see also [25, 26] for applications of this breakthrough).
The nonzero background electromagnetic field couples
the spin-2 and spin-1 sectors directly in the perturbation
equations and closed-form separation of this coupled sys-
tem was not achieved before (see [20]). Previously, some
progress was made [27] through the non-self-consistent
Dudley-Finley decoupling [28], perturbative expansions
in a or Q [29], or, most recently, direct numerical solu-
tion of the genuinely coupled two-field boundary-value
problem [30, 31], whose well-posedness has been estab-
lished rigorously in restricted parameter regimes [32, 33].
The KN QNM spectrum has been studied since
the work of Kokkotas [34] and Berti and Kokkotas
continued-fraction solution of the separable scalar sector,
which also validated the Dudley-Finley approximation
for the coupled gravito-electromagnetic fields at moder-
ate charge [27] (see [25, 35] for recent work). There are a
number of works containing analytic, WKB, and special-
limit studies [36–43]. Near-extremal KN was addressed
analytically in [44], and the fully coupled fields pertur-
batively at weak charge in [29]. A decisive advance came
with the direct numerical solution of the coupled, non-
separable gravito-electromagnetic system [30, 31], estab-
lishing the mode stability of KN BHs and its charac-
teristic eigenvalue repulsion between photon-sphere and
near-horizon mode families, subsequently confirmed for
scalar perturbations [45], and placed on a rigorous math-
ematical footing [32, 33]. Recently, this spectrum has
been revisited with physics-informed neural solvers [46],
exceptional lines in scalar perturbations [47], a critical re-
assessment of the Dudley-Finley approximation [48], and
a correspondence with Seiberg-Witten theory [49].
Exceptional points (EPs) are singularities in the pa-
rameter space of non-Hermitian operators at which two
or more eigenvalues and their eigenvectors coalesce [50],
so that the operator does not have a complete set of eigen-
vectors [51, 52]. In their neighborhood, the eigenvalues
behave as square-root branch points, so that a closed loop
in parameter space encircling an EP exchanges the coa-
lescing states, which do not return to their initial config-
uration, a form of eigenstate hysteresis [51, 53]. EPs are
relevant for physical phenomena in systems such as mi-
crowave resonators [54] and open quantum systems [55].
EPs in the BH QNM spectrum have so far only been
found in cases where an auxiliary massive test scalar
field has been introduced in a Kerr background. The
mass of this scalar field constitutes the second parame-
ter required for a genuine two-parameter non-Hermitian
spectral problem [56]. Whether this phenomenology
can instead arise intrinsically, from the BH own multi-
field perturbation structure, and how the coupled KN-
Teukolsky system should be formulated in a horizon-to-
infinity, boundary-condition-free setting, have remained
open. We address both questions in this letter.
Since EPs of a generic non-Hermitian problem have
real co-dimension two, they appear as isolated points
in a two-parameter space. One can locate EPs in
KN BHs by varying the coordinates of the space
spanned the dimensionless spin and charge, PKN =
{(a/M, Q/M) with (a/M)2 +(Q/M)2 ≤1}, which makes
them an ideal area to explore EPs in connection with
QNMs. Following [30, 31], we can adopt alternative co-
ordinates normalized with respect to the horizon radius:
ˆ
ˆ
a = a/r+ and
Q= Q/r+. In these coordinates, the ex-
ˆ
tremal limit is achieved when: ˆ aext = (1−
Q2)1/2. We can
ˆ
explore the space PKN, scanning
Q∈[0,1] and following
curves of constant ratio
k≡ˆ
a
ˆ
aext
ˆ
=
a
1−
. (1)
ˆ
Q2
In this letter we focus on eigenstate hysteresis: the
non-trivial interchange of coalescing eigenstates when the
system is subject to parametric changes following a quasi-
static trajectory that encircles an EP.
Problem statement. In this letter, we explore the KN
sub-extremal parameter space PKN and accurately map
four EPs in the QNM spectrum and restrict our analysis
to the dominant of the quadrupolar modes ℓ= m = 2.
We report and study the presence of eigenstate hysteresis
around all four EPs found, allowing us to draw unique
connections between BH QNM spectroscopy and general
non-Hermitian spectral topology.
The QNM computations are enabled by building upon
the hyperboloidal foliation framework developed in [57]
for this purpose (see also [58–61]). The present work
constitutes the first reported application to the study of
the KN QNM spectrum, rendering the location of EPs in
the KN QNM spectrum accessible. The key point is that
on constant-t slices (being t the Boyer-Lindquist time
coordinate [62]), QNM eigenfunctions diverge exponen-
2
tially toward the horizon and spatial infinity, so outgoing
boundary conditions must be imposed on a truncated do-
main. Hyperboloidal slices instead cross the event hori-
zon and reach future null infinity I + [58, 59]. QNM
eigenfunctions are then regular, boundary conditions re-
duce to regularity, and the radial domain becomes fi-
nite [60, 61]. We extend the Kerr construction of Ref. [61]
to KN. Let (t,r,θ,φ) be KN Boyer-Lindquist coordinates,
with ∆ = r2
−2Mr+ a2 + Q2 and Σ0 = r2 + a2. We
can introduce ingoing KN coordinates (v,r,θ,ϕ), which
are regular at the future horizon: v = t + r∗(r) and
ϕ= φ+ k(r), where dr∗/dr = Σ0/∆ and dk/dr = a/∆.
We then compactify and bend the slices up to I + by
introducing (τ,σ,θ,ϕ), with
λ
v= λ[τ−h(σ)], r=
σ
, h(σ) = 2 2M
λ ln σ−
1
σ
, (2)
where τ is the hyperboloidal time, σ ∈(0,1] is the com-
pactified radial coordinate, h is the height function, and
λ= r+ is a length scale chosen so that σ = 1 corre-
sponds to the event horizon and σ = 0 to I +. The
choice of h(σ) and of r(σ) encodes the gauge freedom of
the construction, and Eq. (2) is the minimal choice that
fixes the horizon at σ= 1. In these coordinates the radial
and angular operators of the coupled Teukolsky system
become first-order in ∂σ and ∂τ with coefficients regular
on the whole domain. See [35] for their explicit form.
For the numerical implementation we adopt the pseu-
dospectral collocation method, frequently used for BH
perturbation theory and QNM computations [35, 60, 63,
64] (see also [65]). We use a multiple Chebyshev-Lobatto
grid, {(Xi,Yj) ∈[−1,1] ×[−1,1]}(i.e., containing the
boundary points), associated with the hyperboloidal fo-
liation coordinates (σ,θ), being the mapping given by:
σi = (Xi + 1)/2 and cos θj= Yj. Once discretized, the
resulting system can be written as a block-matrix polyno-
mial eigenvalue problem that we solve using the two-level
orthogonal Arnoldi method implemented in the SLEPc
library [66, 67] (see [68–70] for further details). See the
companion paper [70] for the details on the implementa-
tion of the computations shown in this letter.
EPs and eigenvalue repulsion. Work on EPs in BH QNM
spectra has recently flourished (see [71, 72]). In [72], it
is shown that resonant frequencies near an EP induce a
linearly-growing prefactor in the time-domain ringdown
signal which, if unaccounted for in waveform models, may
introduce a bias in the extraction of the QNM. In the
KN case [30, 31], we have two tunable parameters, the
phenomenon of eigenvalue repulsion (avoided crossings)
has recently been found. The phenomenon of eigenvalue
repulsion appears in quantum physics, typically known
as the Wigner-Teller effect [73]. It is also found in a
broader context in bifurcation theory, where mode paths
that break the same symmetry avoid crossing (for in-
stance, in stability problems in hydrodynamics [74, 75]).
We schematically show in Figure 1 the evolution of
eigenvalues near an EP. The real and imaginary parts
k < k ⋆ k = k ⋆ k > k ⋆
Re(2M!)
Im(2M!)
Q=r + Q=r + Q=r +
FIG. 1. Behavior of eigenvalue branches depending on the
ˆ
parameters k and
Q near an EP [See Eq. (1)]. Here, k⋆ de-
notes the value of k at the location of the EP.
Re (2M ω) Im (2M ω) a⋆/M Q⋆/M
EP0
1.12869
±0.00093
−0.056626
±0.000040
0.304065
±0.000029
0.952379
±0.000020
EP1
0.9091
±0.0024
−0.3704
±0.0050
0.220127
±0.000076
0.972975
±0.000076
EP2
0.8984
±0.0058
−0.3833
±0.0038
0.20930
±0.00026
0.97145
±0.00041
EPe
1.5863
±0.0025
−0.2900
±0.0018
0.461164
±0.000056
0.884039
±0.000055
TABLE I. Frequencies and coordinates of four EPs.
ˆ
of two modes are plotted as a function of
Q while keep-
ing k constant. Below the critical value, the imaginary
parts intersect, while the real parts exhibit eigenvalue
repulsion (avoid crossing). At an EP, both the real and
imaginary parts intersect. Beyond the EP, they exchange
roles. This behavior is associated with the solutions of a
quadratic equation in the complex plane. The EP corre-
sponds to a branching point with two associated Riemann
sheets. This implies the possibility of hysteresis. If we
describe a closed path in the parameter space, whether
we move from one sheet to another or remain in the same
sheet depends on whether we enclose or not the branch-
ing point [51].
We have identified, within the KN QNM spectrum, the
precise location of the three instances of EPs responsible
for the avoided crossing reported in [31] (first three rows
of Table I). The fourth one is a new case of repulsion, hap-
pening between electromagnetic-led branches (see Fig. 2).
We track the parametric evolution across PKN of six
different eigenstates within the KN QNM spectrum: the
fundamental mode and the first and second overtones
of both the gravitational (s =−2) and electromagnetic
(s=−1) ℓ= m= 2 states. The appearance of an EP in
3
Im(2M!)
¡0.1
¡0.2
¡0.3
¡0.4
¡0.5
s = ¡2; n = 0
s = s = ¡2; n = 1
¡2; n = 2
s = ¡1; n = 0
s = ¡1; n = 1
s = ¡1; n = 2
k = 0:76
0.0 0.2 0.4 0.6 0.8 1.0
Q=r +
FIG. 2. Parametric evolution of six QNM branches along a
k = 0.76 constant curve. Gravitational modes (in the Kerr
limit) are marked with asterisks, while polygonal markers are
used for electromagnetic modes. Avoided crossing is clearly
visible between the branches (s, n) = (−1, 1) and (−1, 2) .
PKN is signaled by the emergence of the behavior shown
in Fig. 1. Starting from k= 0, we construct branches of
QNMs that evolve continuously, along curves of constant
ˆ
ˆ
k, from the states with
Q= 0 (see Fig. 2). Since
Q= 0
implies Q= 0 for any value of k, the first mode in each
branch must agree with the well-documented [16] Kerr
QNM spectrum for the corresponding value of a.
We denote EPs in PKN as: EPi ≡(a⋆
i,Q⋆
i) (see Ta-
ble I; with i = 0,1,2,e) or alternatively with horizon-
ˆ
normalized coordinates (k⋆
,
Q⋆). Then, we define the
repulsion gap widths ∆I and ∆R as the difference be-
tween the imaginary or real parts of the closest QNM
frequencies within two branches, when said components
(imaginary or real) exhibit avoided crossing. At an EP,
with coordinates (a⋆,Q⋆) ∈PKN, the repulsion-crossing
behavior must satisfy:
lim
(a,Q)→(a⋆ ,Q⋆ )
∆I = lim
(a,Q)→(a⋆ ,Q⋆ )
∆R = 0. (3)
A total of 90 k-constant parameter-sweeps have been
performed, with k ∈ {0,0.01,...0.88,0.89}, where the
evolution of the six specified eigenstates was tracked
through a series of 64 evenly-spaced values within the
ˆ
interval
Q ∈[0,0.96]. We have identified four distinct
regions of PKN where EPs may be located, in light of
Wigner-Teller effect being exhibited within four differ-
ent intervals of k: (i) The repulsion extending within
the broadest range is prominent within k ∈[0.81, 0.86],
between branches (−2, 0) and (−2, 1). We call EP0
the exceptional mode associated with the EP responsi-
ble for this behavior. (ii) Branches (−1, 1) and (−1, 2)
exhibit repulsion within the range k ∈[0.75, 0.77] (vis-
ible in Fig. 2). Due to the electromagnetic nature of
these branches, we call the QNM associated with this
EP, EPe. (iii) For k ∈[0.49,0.51], the (−2,2) branch
shows eigenvalue repulsion with a non-tracked family of
Im(2M!)
¡0.050
¡0.052
¡0.054
¡0.056
¡0.058
¡0.060
Re(2M!)
1.1300
1.1275
0.93100 0.93115
k = 0:815
0.9308 0.9310 0.9312 0.9314
Q=r +
FIG. 3. High-resolution sampling of the branches (s, n) =
(−2, 0) and (−2, 1) in the region (k,ˆ
Q) ∈ {0.815}×
[0.9305, 0.9315]. Unlike in Fig. 2, the avoided crossing oc-
curs in the real part; the cyan line in the inset shows ∆R.
modes, named near-horizon modes in [30]. This is a fam-
ily of eigenstates whose wave function is mostly localized
in the vicinity of the event horizon, and which are only
found at relatively high levels of extremality. We call
the QNM associated with this EP candidate EP1. (iv)
Branches (−2, 0) and (−2, 2) exhibit repulsion within
the range k ∈[0.38, 0.41]. We call the QNM associated
with this EP candidate EP2. Three of the four repul-
sions identified (EP0-EP2) were also reported in [30], the
exception being the one hinting the existence of EPe.
To locate each EP precisely, we sampled the parameter
space at higher resolution near the avoided crossings and
estimated the gaps ∆I and ∆R (see Fig. 3), together with
ˆ
ˆ
Qcrit, the value of
Qat which the branches are closest to
coalescence, for each k. Fitting the gaps to a square-root
profile, as expected near an EP (see Fig. 4), gives k⋆ as
the zero of the fit under the conditions in Eq. 3. A cubic
ˆ
ˆ
fit of
Qcrit(k) (see Fig. 5) then gives
Q⋆ ≡ˆ
Qcrit(k⋆).
Eigenstate hysteresis. Hysteresis of a QNM state is de-
fined as the path-dependence of its evolution when fol-
lowing quasi-static paths in PKN with equal endpoints.
The presence of EPs induces a specific type of hysteresis,
which is the non-trivial exchange of coalescing modes:
tracking their evolution along a closed path in the pa-
rameter space will result in the modes being exchanged
if and only if the path encircles the EP, at which they
coalesce, an odd number of times. This phenomenon
is connected to the underlying topology of the param-
eter space [51]. More specifically, to the fact that EPs
are topologically equivalent to square-root singularities
of the system QNMs.
Observing eigenstate hysteresis serves a dual pur-
pose: it rigorously confirms the existence and loca-
tion of the presumed EPs, and it allows to map
the non-trivial topology of the QNM parameter space,
PKN ×{2Mω}, in the vicinity of an EP. Let us be-
4
¢ℑ, ¢ℜ
0.008
0.006
0.004
0.002
0.000
Numerical fit
99% bounds
0.825
0.820
0.815
k
0.810
0.805
FIG. 4. Values of the repulsion gap widths (circles correspond
to ∆I and squares to ∆R), obtained by sampling in the vicin-
ity of k⋆. The exceptional value k⋆ is where the fit crosses the
dashed line. The fit is consistent with the square-root singu-
larity expected at an EP [51].
Numerical fit
0.935
0.934
99% bounds
Exceptional point
^ Qcrit
0.933
0.93124
0.932
0.931
0.93118
0.93112
0.8160
0.8156
0.8152
0.86
0.85
0.84
k
0.83
0.82
FIG. 5. Values of critical relative charge retrieved by sampling
for k > k⋆. The EP color scheme is chosen regarding the
eigenvalue branches on which it induces coalescence.
gin by analyzing hysteresis around EPe, with coordi-
nates (a⋆
e,Q⋆
e) = (0.461164,0.884039)M. We construct a
closed contour defined by four points in PKN (see Fig. 6):
A = (0.9996a⋆
e,1.0004Q⋆
e), B = (0.9996a⋆
e,0.9996Q⋆
e),
C = (1.0004a⋆
e,1.0004Q⋆
e), D = (1.0004a⋆
e,0.9996Q⋆
e).
Then, we track the evolution by varying the parameters
a/M, Q/M along two contours with identical endpoints:
ΓAD ≡A →D and ΓABCD ≡A →B →C →D. The
choice of points ensures that the union ΓABCD ∪ΓAD
encloses EPe as represented in Fig. 6. We use the sub-
scripts αand β to denote the (s,n) = (−1,1) and (−1,2)
modes, respectively.
At the starting point A, we find: (ωα)A = 1.59904−
0.29499 i and (ωβ)A = 1.57025−0.27084 i. Following
the path ΓABCD yields the transformation: (ωα,β)A →
···→(ωα,β)C →(ωα,β)D in such a way that (ωα)C →
Q=M
0.8846
0.8844
0.8842
0.8840
0.8838
0.8836
A
D
EPe
C
B
99:780%
99:734%
99:687%
99:641%
Extremality (%)
0.4610 0.4612 0.4614
a=M
FIG. 6. Closed, quasi-static path around EPe that induces
hysteresis on the states (s, n) = (−1, 1) and (−1, 2) coalescing
at EPe. The dashed line from A to D indicates the variation
by following ΓAD in contrast to ΓABCD.
Im(2M!)
¡0.26
¡0.27
¡0.28
¡0.29
¡0.30
¡0.31
¡0.32
(!®)D
(!¯)A
(!®)C
! ⋆
e
(!®)
B
(!®)
(!¯)
(!¯)D
¡0.294
(!®)A
(!¯)C
¡0.295
(!¯)
B
1.598 1.600 1.602
1.57 1.58 1.59 1.60
Re(2M!)
FIG. 7. Evolution of the QNM frequencies tracked along
ΓABCD (solid lines) and ΓAD (dashed lines). Here, we use
ωα to denote frequencies corresponding to the (−1, 1) QNM
branch, and ωβ to denote those corresponding to the (−1, 2)
branch. Non-trivial exchange of states is present, confirming
hysteresis has been successfully induced.
(ωα)D = 1.56579−0.26032 i, (ωβ)C → (ωβ)D =
1.60207−0.29380 i. On the other hand, evolving along
ΓAD produces the transformation: (ωα,β)A →(ωα,β)D,
such that (ωα)A → (ωα)D = 1.60207−0.29380 i and
(ωβ)A →(ωβ)D = 1.56579−0.26032 i. This confirms
the path dependence of the state evolution in the form of
non-trivial exchanges, as illustrated in Fig. 7. We have
also observed this expected behavior for the other EPs
in Table I (EP0-EP2) using analogous contours, but for
brevity we do not give all details here (see [70]).
The topology of PKN ×{2Mω}near each EP is shown
to be equivalent to that of a pair of Riemann sheets con-
nected at the EP (typical of a square-root branch point).
As anticipated, exchange of states corresponds to switch-
5
!®
!¯
! ⋆
e
A
B
1
0
¡1
± Re (2M !)
¡1
± a
0
D
C
1
¡1 0 1
± Q
FIG. 8. Qualitative representation of the (real-part-projection
of) PKN ×{2M ω} in the vicinity of EPe. The exchange
of states is shown to correspond to a change of Riemann
sheet (indicated by the color-mapping), allowed by the self-
intersection of the Riemann surface between C and D, where
the real parts of ωα and ωβ undergo crossing.
ing from one of the sheets to the other as shown in Fig. 8.
Given the proximity of EP1 and EP2, we can construct
a closed path in parameter space encircling both EPs at
once without leaving their vicinity. Here, the evolution
of three different states must be tracked, for each EP
induces coalescence of a different pair: (s,n) = (−2,2)
with (−2,1) and (−2,2) with near-horizon modes. As il-
lustrated in Fig. 9, this yields the non-trivial exchange
of the three states in a cycle: (−2,1) → (−2,2) →
NH → (−2,1) → ···. The resulting cycle of states
is, as expected, compatible with the local topology
found for a close neighbourhood of EP1 and EP2 within
PKN ×{2Mω}(i.e., that of a pair of square-root Riemann
sheets).
Conclusions and discussion. We have shown that EPs
and eigenstate hysteresis arise intrinsically in KN QNM
spectrum, illustrated with the study of the ℓ= m = 2
mode. The coupling between gravitational and electro-
magnetic perturbations supplies the second real param-
eter that an EP requires, so no auxiliary field is needed,
in contrast with the Kerr case. The hyperboloidal for-
mulation of the coupled Teukolsky system, discretised on
a Chebyshev pseudospectral grid, made it possible to re-
solve the spectrum accurately close to extremality.
We have located four EPs. Three of them, EP0, EP1
and EP2, are responsible for the instances of the Wigner-
Teller effect previously reported [30, 31]. The fourth,
EPe, comes from a previously unreported repulsion be-
tween electromagnetic-led branches (see Fig. 6). All four
EPs lie in the near-extremal region, from 99.3741% (EP2)
(!®)D
Im(2M!)
¡0.2
¡0.3
¡0.4
¡0.5
¡0.6
(!®)
(!¯)
(!®)C
(!¯)D
(!°)
(!¯)A
! ⋆
1
(!¯)C
! ⋆
2
(!¯)
B
¡0.36
(!°)C
(!®)
B
(!°)D
(!°)A
¡0.38
(!®)A
¡0.40
0.92 0.93
(!°)
B
0.86 0.88 0.90 0.92 0.94
Re(2M!)
FIG. 9. Evolution of the QNM frequencies tracked along the
closed path ΓABCDA, with the last segment shown as dashed
lines. Here, ωα and ωβ denote the QNM frequencies of the
(s, n) = (−2, 1) and (−2, 2) branches, respectively. The fre-
quency ωγ corresponds to the near-horizon branch. A 3-cyclic
non-trivial exchange of states is now exhibited.
to 99.9740% (EP0) of extremality, and none is close to the
Reissner-Nordstr¨om limit, although EP1 and EP2 have a
larger relative charge than spin (see Table I).
Quasi-static loops around each EP exchange the coa-
lescing modes (see Figs. 6–8 for EPe), and a loop enclos-
ing EP1 and EP2 permutes three modes cyclically (see
Fig. 9), as expected from the Riemann-sheet structure
around the EPs (see Fig. 8). Together with the square-
root closing of the repulsion gaps, this identifies the four
EPs as branch-point singularities of the spectrum rather
than numerical artefacts, and links BH spectroscopy to
[1] W. Israel, Event horizons in static vacuum space-times,
Phys. Rev. 164, 1776 (1967).
[2] B. Carter, Axisymmetric black hole has only two degrees
of freedom, Phys. Rev. Lett. 26, 331 (1971).
[3] D. C. Robinson, Uniqueness of the Kerr black hole, Phys.
Rev. Lett. 34, 905 (1975).
[4] P. O. Mazur, Proof of uniqueness of the Kerr-Newman
black hole solution, J. Phys. A 15, 3173 (1982).
[5] P. T. Chrusciel, J. Lopes Costa, and M. Heusler, Station-
ary black holes: Uniqueness and beyond, Living Rev. Rel.
15, 7 (2012), arXiv:1205.6112 [gr-qc].
[6] T. Regge and J. A. Wheeler, Stability of a Schwarzschild
singularity, Phys. Rev. 108, 1063 (1957).
[7] C. V. Vishveshwara, Scattering of gravitational radiation
by a Schwarzschild black-hole, Nature 227, 936 (1970).
[8] E. W. Leaver, An analytic representation for the quasi
normal modes of Kerr black holes, Proc. Roy. Soc. Lond.
A 402, 285 (1985).
[9] K. D. Kokkotas and B. G. Schmidt, Quasinormal modes
of stars and black holes, Living Rev. Rel. 2, 2 (1999),
arXiv:gr-qc/9909058.
[10] E. Berti, V. Cardoso, and A. O. Starinets, Quasinormal
6
the many physical scenarios where EP effects are stud-
ied, such as microwave, acoustic and optomechanical sys-
tems [54, 76, 77].
Observing hysteresis in a physical process would re-
quire closed, adiabatic cycles in the parameter space
PKN. Superradiance changes (a,Q) only monotoni-
cally [78], so a closed cycle would need, for example, ac-
cretion of charged matter, and designing such a process
is an open problem. The other (ℓ,m) sectors, especially
high-order multipoles (ℓ > 2), very likely contain fur-
ther EPs. An EP close enough to the Kerr limit could
leave a signature in the ringdown [72], and so help con-
strain small charges in astrophysical BHs, although the
EPs found here require charge-to-mass ratios that are
unlikely astrophysically.
Acknowledgments. The authors thank M.G. Benot,
V. Cardoso, R. Panosso Macedo, and A. Zengino˘glu
for their feedback on different aspects of this work.
M.M.A and A.T.P work was partly funded by the in-
novation project SOL2024-31517, funded by the EU
- Ministerio de Hacienda y Funci´on P´ublica - Fon-
dos Europeos - Junta de Andaluc´ıa – Consejer´ıa
de Universidad, Investigaci´on e Innovaci´on. C.F.S.
work was supported by contract PID2022-137674NB-
I00/AEI/10.13039/501100011033 (Spanish Ministry of
Science and Innovation) and 2017-SGR-1469 (AGAUR,
Generalitat de Catalunya), and partly supported
by the Spanish program Unidad de Excelencia
Mar´ıa de Maeztu CEX2020-001058-M, financed by
MCIN/AEI/10.13039/501100011033, and by the MaX-
CSIC Excellence Award MaX4-SOMMA-ICE.
Data availability. The data are available from the authors
upon reasonable request.
modes of black holes and black branes, Class. Quant.
Grav. 26, 163001 (2009), arXiv:0905.2975.
[11] B. P. Abbott et al. (LIGO Scientific, Virgo), Observation
of gravitational waves from a binary black hole merger,
Phys. Rev. Lett. 116, 061102 (2016), arXiv:1602.03837
[gr-qc].
[12] B. P. Abbott et al. (LIGO Scientific, Virgo), Tests of
general relativity with GW150914, Phys. Rev. Lett. 116,
221101 (2016), [Erratum: Phys.Rev.Lett. 121, 129902
(2018)], arXiv:1602.03841 [gr-qc].
[13] A. G. Abac et al. (LIGO Scientific, Virgo, KAGRA),
Black hole spectroscopy and tests of general relativity
with GW250114, Phys. Rev. Lett. 136, 041403 (2026),
arXiv:2509.08099 [gr-qc].
[14] S. L. Detweiler, Black holes and gravitational waves. III.
The resonant frequencies of rotating holes, Astrophys. J.
239, 292 (1980).
[15] O. Dreyer, B. J. Kelly, B. Krishnan, L. S. Finn, D. Gar-
rison, and R. Lopez-Aleman, Black hole spectroscopy:
Testing general relativity through gravitational wave ob-
servations, Class. Quant. Grav. 21, 787 (2004), arXiv:gr-
qc/0309007.
[16] E. Berti, V. Cardoso, and C. M. Will, On gravitational-
wave spectroscopy of massive black holes with the space
interferometer LISA, Phys. Rev. D 73, 064030 (2006),
arXiv:gr-qc/0512160.
[17] E. T. Newman, E. Couch, K. Chinnapared, A. Ex-
ton, A. Prakash, and R. Torrence, Metric of a rotating,
charged mass, J. Math. Phys. 6, 918 (1965).
[18] T. Adamo and E. T. Newman, The Kerr-Newman metric:
A review, Scholarpedia 9, 31791 (2014), arXiv:1410.6626
[gr-qc].
[19] R. P. Kerr, Gravitational field of a spinning mass as an
example of algebraically special metrics, Phys. Rev. Lett.
11, 237 (1963).
[20] S. Chandrasekhar, The Mathematical Theory of Black
Holes, International Series of Monographs on Physics,
Vol. 69 (Clarendon Press, Oxford, 1983).
[21] G. W. Gibbons, Vacuum polarization and the sponta-
neous loss of charge by black holes, Commun. Math.
Phys. 44, 245 (1975).
[22] E. Newman and R. Penrose, An approach to gravitational
radiation by a method of spin coefficients, J. Math. Phys.
3, 566 (1962).
[23] S. A. Teukolsky, Perturbations of a rotating black hole. 1.
Fundamental equations for gravitational electromagnetic
and neutrino field perturbations, Astrophys. J. 185, 635
(1973).
[24] P. Hintz, Perturbations of Kerr-Newman black holes:
separation and mode stability, (2026), arXiv:2609.33661
[gr-qc].
[25] K. Destounis, V. Cardoso, and P. Hintz, The quasinor-
mal modes of Kerr-Newman black holes: a separated ap-
proach, (2026), arXiv:2610.07142 [gr-qc].
[26] S. Chakraborty, T. Katagiri, P. Pani, and J.-X. Shi,
Vanishing Love numbers of Kerr-Newman black holes,
(2026), arXiv:2610.17179 [gr-qc].
[27] E. Berti and K. D. Kokkotas, Quasinormal modes of
Kerr-Newman black holes: Coupling of electromagnetic
and gravitational perturbations, Phys. Rev. D 71, 124008
(2005), arXiv:gr-qc/0502065.
[28] A. L. Dudley and J. D. Finley, Separation of wave equa-
tions for perturbations of general type-D space-times,
Phys. Rev. Lett. 38, 1505 (1977).
[29] Z. Mark, H. Yang, A. Zimmerman, and Y. Chen, Quasi-
normal modes of weakly charged Kerr-Newman space-
times, Phys. Rev. D 91, 044025 (2015), arXiv:1409.5800
[gr-qc].
[30] O. J. C. Dias, M. Godazgar, J. E. Santos, G. Carullo,
W. Del Pozzo, and D. Laghi, Eigenvalue repulsions in
the quasinormal spectra of the Kerr-Newman black hole,
Phys. Rev. D 105, 084044 (2022), arXiv:2109.13949 [gr-
qc].
[31] O. J. C. Dias, M. Godazgar, and J. E. Santos, Eigen-
value repulsions and quasinormal mode spectra of
Kerr-Newman: An extended study, JHEP 07, 076,
arXiv:2205.13072 [gr-qc].
[32] E. Giorgi, Boundedness and decay for the Teukolsky sys-
tem in Kerr-Newman spacetime I: The case |a|, |Q|≪M ,
(2023), arXiv:2311.07408 [gr-qc].
[33] E. Giorgi, Electromagnetic–gravitational perturbations
of Kerr–Newman black hole, International Journal of
Modern Physics D 35, 2540003 (2026).
[34] K. D. Kokkotas, Quasinormal modes of the Kerr-
Newman black hole, Nuovo Cim. B 108, 991 (1993).
[35] O. J. C. Dias, M. Godazgar, and J. E. Santos, Linear
7
mode stability of the Kerr-Newman black hole and its
quasinormal modes, Phys. Rev. Lett. 114, 151101 (2015),
arXiv:1501.04625 [gr-qc].
[36] J.-l. Jing and Q.-y. Pan, Dirac quasinormal frequencies
of the Kerr-Newman black hole, Nucl. Phys. B 728, 109
(2005), arXiv:gr-qc/0506098.
[37] J.-L. Jing and C.-K. Ding, Quasinormal spectrum and
quantization of the Kerr-Newman black hole, Chin. Phys.
Lett. 25, 858 (2008).
[38] K. D. Kokkotas, R. A. Konoplya, and A. Zhidenko,
Quasinormal modes, scattering and Hawking radiation
of Kerr-Newman black holes in a magnetic field, Phys.
Rev. D 83, 024031 (2011), arXiv:1011.1843 [gr-qc].
[39] W. E. Couch and C. L. Holder, Liouvillian quasi-normal
modes of Kerr-Newman black holes, J. Math. Phys. 53,
062502 (2012).
[40] R. A. Konoplya and A. Zhidenko, Massive charged scalar
field in the Kerr-Newman background I: Quasinormal
modes, late-time tails and stability, Phys. Rev. D 88,
024054 (2013), arXiv:1307.1812 [gr-qc].
[41] S. Hod, Universality of the quasinormal spectrum of near-
extremal Kerr-Newman black holes, Eur. Phys. J. C 75,
272 (2015), arXiv:1410.2252 [gr-qc].
[42] S. Hod, Numerical evidence for universality in the re-
laxation dynamics of near-extremal Kerr-Newman black
holes, Eur. Phys. J. C 75, 611 (2015), arXiv:1511.05696
[hep-th].
[43] P. Zhao, Y. Tian, X. Wu, and Z.-Y. Sun, The quasi-
normal modes of charged scalar fields in Kerr-Newman
black hole and its geometric interpretation, JHEP 11,
167, arXiv:1506.08276 [gr-qc].
[44] S. Hod, Quasinormal resonances of near-extremal Kerr-
Newman black holes, Phys. Lett. B 666, 483 (2008),
arXiv:0810.5419 [gr-qc].
[45] A. Davey, O. J. C. Dias, and J. E. Santos, Scalar QNM
spectra of Kerr and Reissner-Nordstr¨om revealed by
eigenvalue repulsions in Kerr-Newman, JHEP 12, 101,
arXiv:2305.11216 [gr-qc].
[46] A. M. Pombo, Coupled by design: computing Kerr-
Newman quasinormal modes with a hybrid Spec-
tralPINN solver, JCAP 09, 076, arXiv:2607.14216 [gr-
qc].
[47] J. P. Cavalcante and M. Richartz, Exceptional lines
in the Kerr-Newman black hole spectrum, (2026),
arXiv:2607.09878 [gr-qc].
[48] S. Saha and H. O. Silva, Quasinormal modes of Kerr-
Newman black holes: Revisiting the Dudley-Finley
approximation, Phys. Rev. D 113, 064009 (2026),
arXiv:2510.05354 [gr-qc].
[49] H. O. Silva, J.-W. Kim, and M. V. S. Saketh, Kerr-
Newman quasinormal modes and Seiberg-Witten theory,
Phys. Rev. D 111, 104021 (2025), arXiv:2502.17488 [gr-
qc].
[50] T. Kato, Perturbation theory for linear operators, 2nd
ed., Classics in Mathematics (Springer, Berlin, Germany,
1995).
[51] W. D. Heiss, The physics of exceptional points, Journal
of Physics A: Mathematical and Theoretical 45, 444016
(2012).
[52] M.-A. Miri and A. Al`u, Exceptional points in optics and
photonics, Science 363, eaar7709 (2019).
[53] J. Doppler, A. A. Mailybaev, J. B¨ohm, U. Kuhl,
A. Girschik, F. Libisch, T. J. Milburn, P. Rabl, N. Moi-
seyev, and S. Rotter, Dynamically encircling an excep-
tional point for asymmetric mode switching, Nature 537,
76 (2016).
[54] C. Dembowski, H.-D. Gr¨af, H. L. Harney, A. Heine,
W. D. Heiss, H. Rehfeld, and A. Richter, Experimen-
tal observation of the topological structure of exceptional
points, Phys. Rev. Lett. 86, 787 (2001).
[55] Y. Choi, S. Kang, S. Lim, W. Kim, J.-R. Kim, J.-H.
Lee, and K. An, Quasieigenstate coalescence in an atom-
cavity quantum composite, Phys. Rev. Lett. 104, 153601
(2010).
[56] J. P. Cavalcante, M. Richartz, and B. C. da Cunha,
Exceptional point and hysteresis in perturbations of
Kerr black holes, Phys. Rev. Lett. 133, 261401 (2024),
arXiv:2407.20850 [gr-qc].
[57] R. Panosso Macedo and A. Zenginoglu, Hyperboloidal
approach to quasinormal modes, Front. in Phys. 12,
1497601 (2024), arXiv:2409.11478 [gr-qc].
[58] A. Zenginoglu, Hyperboloidal foliations and scri-fixing,
Class. Quant. Grav. 25, 145002 (2008), arXiv:0712.4333
[gr-qc].
[59] A. Zenginoglu, A geometric framework for black
hole perturbations, Phys. Rev. D 83, 127502 (2011),
arXiv:1102.2451 [gr-qc].
[60] R. Panosso Macedo, Hyperboloidal framework for the
Kerr spacetime, Class. Quant. Grav. 37, 065019 (2020),
arXiv:1910.13452 [gr-qc].
[61] J. Assaad and R. Panosso Macedo, Quasinormal modes
in Kerr spacetime as a 2D eigenvalue problem, Class.
Quant. Grav. 42, 245008 (2025), arXiv:2506.04326 [gr-
qc].
[62] R. H. Boyer and R. W. Lindquist, Maximal analytic ex-
tension of the Kerr metric, J. Math. Phys. 8, 265 (1967).
[63] P. Canizares and C. F. Sopuerta, An efficient pseu-
dospectral method for the computation of the self-
force on a charged particle: Circular geodesics around
a Schwarzschild black hole, Phys. Rev. D 79, 084020
(2009), arXiv:0903.0505 [gr-qc].
[64] P. Canizares, C. F. Sopuerta, and J. L. Jaramillo, Pseu-
dospectral collocation methods for the computation of
the self-Force on a charged particle: Generic orbits
around a Schwarzschild black hole, Phys. Rev. D 82,
044023 (2010), arXiv:1006.3201 [gr-qc].
[65] J. P. Boyd, Chebyshev and Fourier spectral methods, 2nd
ed. (Dover Publications, 2013).
[66] V. Hernandez, J. E. Roman, and V. Vidal, SLEPc: A
8
scalable and flexible toolkit for the solution of eigenvalue
problems, ACM Trans. Math. Software 31, 351 (2005).
[67] C. Campos and J. E. Roman, Parallel Krylov solvers for
the polynomial eigenvalue problem in SLEPc, SIAM J.
Sci. Comput. 38, S385 (2016).
[68] V. Hern´andez, J. E. Rom´an, and A. Tom´as, Parallel
Arnoldi eigensolvers with enhanced scalability via global
communications rearrangement, Parallel Comput. 33,
521 (2007).
[69] J. E. Roman, F. Alvarruiz, C. Campos, L. Dalcin, P. Jo-
livet, and A. Lamas Davi˜na, Improvements to SLEPc in
releases 3.14–3.18, ACM Trans. Math. Software 49, 29:1
(2023).
[70] M. Misas Arcos, A. T. P´erez, and C. F. Sop-
uerta, Exceptional points in the Kerr-Newman gravito-
electromagnetic spectrum via a hyperboloidal approach:
extended study, submitted to Phys. Rev. D (2026).
[71] J. a. P. Cavalcante, M. Richartz, and B. C. da Cunha,
Ergodic hysteresis of the Kerr black hole spectrum, Phys.
Rev. D 113, L101504 (2026).
[72] Y. Yang, E. Berti, and N. Franchini, Black hole quasi-
normal mode resonances, Phys. Rev. Lett. 135, 201401
(2025), arXiv:2504.06072 [gr-qc].
[73] L. D. Landau and E. M. Lifshitz, Quantum Mechanics:
Non-Relativistic Theory, 3rd ed., Course of Theoretical
Physics, Vol. 3 (Pergamon Press, Oxford, 1977).
[74] A. van de Vooren and H. Dukstra, A finite element stabil-
ity analysis for the Marangoni problem in a rectangular
container with rigid sidewalls, Computers & Fluids 17,
467 (1989).
[75] A. T. P´erez, P. A. V´azquez, J. Wu, and P. Traor´e, Elec-
trohydrodynamic linear stability analysis of dielectric liq-
uids subjected to unipolar injection in a rectangular en-
closure with rigid sidewalls, Journal of Fluid Mechanics
758, 586–602 (2014).
[76] V. Igoshin, M. Tsimokha, A. Nikitina, M. Petrov, I. Tof-
tul, and K. Frizyuk, Exceptional points in single open
acoustic resonator due to symmetry breaking, Phys. Rev.
B 109, 144102 (2024).
[77] C. A. Jones, Multiple eigenvalues and mode classification
in plane oiseuille flow, The Quarterly Journal of Mechan-
ics and Applied Mathematics 41, 363 (1988).
[78] W. H. Press and S. A. Teukolsky, Floating orbits, super-
radiant scattering and the black-hole bomb, Nature 238,
211 (1972).
Paper Mario
