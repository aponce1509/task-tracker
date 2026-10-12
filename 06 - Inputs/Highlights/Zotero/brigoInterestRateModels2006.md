---
tags: []
category:
  - "[[Reference]]"
document_type:
  - capture
par:
  - "[[interest_rates]]"
status: wip
---
# Interest rate models: theory and practice: with smile, inflation, and credit

URL: Zotero Link:
[Interest rate models: theory and practice: with smile, inflation, and credit](zotero://select/library/items/353AUUI8)

Contents” Orange Highlight
[Page 40](zotero://open-pdf/library/items/353AUUI8?page=40&annotation=LKIUY6TR)

BASIC DEFINITIONS AND NO ARBITRAGE” Orange Highlight
[Page 52](zotero://open-pdf/library/items/353AUUI8?page=52&annotation=BW3PHC9P)

Government rates are usually deduced by bonds issued by governments” Green
Highlight
[Page 53](zotero://open-pdf/library/items/353AUUI8?page=53&annotation=4MR27DQX)

By “interbank rates” we denoteinstead rates at which deposits are exchanged
between banks, and at whichswap transactions (see below) between banks occur.”
Green Highlight
[Page 53](zotero://open-pdf/library/items/353AUUI8?page=53&annotation=2VL8EF8S)

Zero-coupon rates (see below) can be “stripped” either from bonds in the
government sector of the market or from products in the interbank sector of the
market, resulting in two different zero-coupon curves” Yellow Highlight
[Page 53](zotero://open-pdf/library/items/353AUUI8?page=53&annotation=K9QHJZA5)

1.1 The Bank Account and the Short Rate” Orange Highlight
[Page 54](zotero://open-pdf/library/items/353AUUI8?page=54&annotation=5ZBJPYWX)

When depositing a certain amount of money in a bank account, everybody expects
that the amount grows (at some rate) as time goes by.” Yellow Highlight
[Page 54](zotero://open-pdf/library/items/353AUUI8?page=54&annotation=WU77FGWL)

The first definition we consider is the definition of a bank account, or
money-market account. A money-market account represents a (locally) riskless
investments, where profit is accrued continuously at the risk-free rate
prevailing in the market at every instant” Green Highlight
[Page 54](zotero://open-pdf/library/items/353AUUI8?page=54&annotation=25IQ3K5P)

Bank account

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-54-x50-y260.png]]

Implica que estamos reinvirtiendo todo el rato

This instantaneous rate is usually referred to as instantaneous spot
rate,orbrieflyasshort rate” Red Highlight
[Page 54](zotero://open-pdf/library/items/353AUUI8?page=54&annotation=BRZTP694)

The bank-account numeraire1 B is important for relating amounts of currencies
available at different times.” Red Highlight
[Page 55](zotero://open-pdf/library/items/353AUUI8?page=55&annotation=N8A2YJPR)

Cuanto vale mi dinero en el futuro

What is the value at time t of one unit of currency available at time T ?” Blue
Highlight
[Page 55](zotero://open-pdf/library/items/353AUUI8?page=55&annotation=JI527AMV)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-55-x48-y398.png]]

Aqui lo que hacemos es decir: oye cuanto tengo que meter en la bank account para
que en tiempo T tenga 1.

We have thus seen that the value of one unit of currency payable at time T , as
seen from time t,isB(t)/B(T )” Red Highlight
[Page 55](zotero://open-pdf/library/items/353AUUI8?page=55&annotation=9J4X34PQ)

Definition 1.1.2. Stochastic discount factor. The (stochastic) discount factor
D(t, T ) between two time instants t and T is the amount at time t that is
“equivalent” to one unit of currency payable at time T” Green Highlight
[Page 55](zotero://open-pdf/library/items/353AUUI8?page=55&annotation=KDIEMD39)

However, when dealing with interest-rate products, the main variability that
matters is clearly that of the interest rates themselves. It is therefore
necessary to drop the deterministic setup and to start modeling the evolution of
r in time through a stochastic process” Red Highlight
[Page 55](zotero://open-pdf/library/items/353AUUI8?page=55&annotation=WREZY4JR)

1.2 Zero-Coupon Bonds and Spot Interest Rates” Orange Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=J4VFWHXM)

Definition 1.2.1. Zero-coupon bond. A T -maturity zero-coupon bond (pure
discount bond) is a contract that guarantees its holder the payment of one unit
of currency at time T , with no intermediate payments. The contract value at
time t<T is denoted by P (t, T ). Clearly, P (T,T)=1for all T.” Green Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=8UU4IJN4)

a zero-coupon bond for the maturity T is a contract that establishes the present
value of one unit of currency to be paid at time T” Red Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=RDW435BE)

A natural question arising now is: What is the relationship between the discount
factor D(t, T ) and the zero-coupon-bond price P (t, T )?” Blue Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=5JYNPTHN)

If rates r are deterministic, then D is deterministic as well and necessarily
D(t, T )=P (t, T ) for each pair (t, T )” Yellow Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=EQ9IIYYX)

We will see later on in the book that the bond price P (t, T )and the discount
factor D(t, T ) are closely linked, in that P (t, T ) can be actually viewed as
the expectation of the random variable D(t, T ) under a particular probability
measure” Red Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=6JEFFJV4)

Definition 1.2.2. Time to maturity. The time to maturity T − t is the amount of
time (in years) from the present time t to the maturity time T>t” Green
Highlight
[Page 56](zotero://open-pdf/library/items/353AUUI8?page=56&annotation=MH2DN4UG)

Year fraction, Day-count convention” Orange Highlight
[Page 57](zotero://open-pdf/library/items/353AUUI8?page=57&annotation=BJI94MFN)

τ (t, T ) is to be interpreted as the time difference T − t (in years).” Green
Highlight
[Page 57](zotero://open-pdf/library/items/353AUUI8?page=57&annotation=FYXSW7JC)

Zero-coupon-bond prices are the basic quantities in interest-rate theory, and
all interest rates can be defined in terms of zero-coupon-bond prices” Yellow
Highlight
[Page 58](zotero://open-pdf/library/items/353AUUI8?page=58&annotation=XI5T3EXQ)

Notice, however, that interest rates are what is usually quoted in (interbank)
financial markets, whereas zero-coupon bonds are theoretical instruments that,
as such, are not directly observable in the market.” Red Highlight
[Page 58](zotero://open-pdf/library/items/353AUUI8?page=58&annotation=KKQSWWI8)

In moving from zero-coupon-bond prices to interest rates, and vice versa, we
need to know two fundamental features of the rates themselves: The compounding
type and the day-count convention to be applied in the rate definition.” Blue
Highlight
[Page 58](zotero://open-pdf/library/items/353AUUI8?page=58&annotation=H2YVVCP6)

Compounding Types

We finally remark that all previous definitions of spot interest rates are
equivalent in infinitesimal time intervals. Indeed, it can be easily proved that
the short rate is obtainable as a limit of all the different rates defined
above, that is, for each t,” Red Highlight
[Page 60](zotero://open-pdf/library/items/353AUUI8?page=60&annotation=HZMADGVR)

1.3 Fundamental Interest-Rate Curves” Orange Highlight
[Page 61](zotero://open-pdf/library/items/353AUUI8?page=61&annotation=MZQTRCAL)

A fundamental curve that can be obtained from the market data of interest rates
is the zero-coupon curve at a given date t. This curve is the graph of the
function mapping maturities into rates at times t.” Yellow Highlight
[Page 61](zotero://open-pdf/library/items/353AUUI8?page=61&annotation=MXVAUC4L)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-61-x47-y392.png]]

The term “yield curve” is often used to denote several different curves deduced
from the interest-rate-market quotes, and is in fact slightly ambiguous” Red
Highlight
[Page 61](zotero://open-pdf/library/items/353AUUI8?page=61&annotation=3YCWL98T)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-62-x44-y169.png]]

the zero-bond curve is less informative than the zero-coupon curve” Red
Highlight
[Page 62](zotero://open-pdf/library/items/353AUUI8?page=62&annotation=B75ES8BS)

FORWARD RATES La idea es que tu pides en T el nominal y lo devuelves en S. El
contrato (al que le queremos calcular el precio) te da en S: (S - T) _ K _ N. El
precio en S es lo que has ganado. Para calcular su precio en t hay que
descontar.

Forward rates are characterized by three time instants, namely the time t at
which the rate is considered, its expiry T and its maturity S,witht ≤ T ≤ S.
Forward rates are interest rates that can be locked in today for an investment
in a future time period, and are set consistently with the current term
structure of discount factors” Yellow Highlight
[Page 63](zotero://open-pdf/library/items/353AUUI8?page=63&annotation=ZATV6HJ8)

We can define a forward rate through a prototypical forward-rate agreement
(FRA). A FRA is a contract involving three time instants: The current time t,
the expiry time T>t, and the maturity time S>T. The contract gives its holder an
interest-rate payment for the period between T and S.At the maturity S, a fixed
payment based on a fixed rate K is exchanged against a floating payment based on
the spot rate L(T,S) resetting in T and with maturity S” Green Highlight
[Page 63](zotero://open-pdf/library/items/353AUUI8?page=63&annotation=MKWES3UN)

La idea es que en un instante t yo quiero pedir/dar un prestamo en T

Clearly, if L is larger than K at time T , the contract value is negative,”
Yellow Highlight
[Page 63](zotero://open-pdf/library/items/353AUUI8?page=63&annotation=MEE7MTNG)

There is just one value of K that renders the contract fair at time t, i.e.
suchthat the contract value is 0 in t. This value is of course obtained by
equating to zero the FRA value. The resulting rate defines the
(simply-compounded) forward rate” Yellow Highlight
[Page 64](zotero://open-pdf/library/items/353AUUI8?page=64&annotation=5MEEQXVX)

Therefore, to value a FRA, we just have to replace the LIBOR rate L(T, S) in the
payoff (1.17) with the corresponding forward rate F (t; T, S), and then take the
present value of the resulting (deterministic) quantity.” Red Highlight
[Page 64](zotero://open-pdf/library/items/353AUUI8?page=64&annotation=YZ2EDJA5)

Esto de memoria

In particular, we will see later on that F (t; T, S) is the expectation of L(T,
S) at time t under a suitable probability measure.” Red Highlight
[Page 64](zotero://open-pdf/library/items/353AUUI8?page=64&annotation=T9BBLN7K)

the instantaneous forward interest rate f (t, T ) is a forward interest rate at
time t whose maturity is very close to its expiry T” Red Highlight
[Page 65](zotero://open-pdf/library/items/353AUUI8?page=65&annotation=WW45HCFB)

Indeed, it turns out that one of the most general ways toexpress “fairness” of
an interest-rate model is to relate certain quantities inthe expression for the
evolution of f. The “fairness” we refer to is the absenceof arbitrage
opportunities, as we shall define it precisely later on in the book,and the
theoretical framework expressing this absence of arbitrage is the celebrated
Heath, Jarrow and Morton (1992) framework, to which Chapter 5 of the present
book is devoted” Yellow Highlight
[Page 65](zotero://open-pdf/library/items/353AUUI8?page=65&annotation=CGXADASY)

(1.24)” Purple Highlight
[Page 66](zotero://open-pdf/library/items/353AUUI8?page=66&annotation=YGN9J7YP)

The two legs of an IRS can be seen as two fundamental prototypical contracts.
The fixed leg can be thought of as a coupon-bearing bond, and the floating leg
can be thought of as a floating-rate note. An IRS can then be viewed as a
contract for exchanging the coupon-bearing bond for the floating-rate note that
are defined as follows.” Red Highlight
[Page 66](zotero://open-pdf/library/items/353AUUI8?page=66&annotation=HX4NEC5L)

meaning that a prototypical floating-rate note is always equivalent to N units”
Purple Highlight
[Page 67](zotero://open-pdf/library/items/353AUUI8?page=67&annotation=XPLNVVU2)

We conclude this chapter by introducing the two main derivative products of the
interest-rates market, namely caps and swaptions” Blue Highlight
[Page 68](zotero://open-pdf/library/items/353AUUI8?page=68&annotation=RULILB3F)

These derivatives, termed swap options or more commonly swaptions, are options
on an IRS. There are two main types of swaptions, a payer version and a receiver
version.” Yellow Highlight
[Page 71](zotero://open-pdf/library/items/353AUUI8?page=71&annotation=KQ55NPTP)

In this chapter, we start by reviewing the main results of Harrison and Pliska
(1981, 1983). We then describe the change-of-numeraire technique as developed by
Geman et al. (1995) and provide a useful toolkit explaining how the various
dynamics change when changing the numeraire.” Yellow Highlight
[Page 75](zotero://open-pdf/library/items/353AUUI8?page=75&annotation=C5FXI332)

semimartingale” Yellow Highlight
[Page 76](zotero://open-pdf/library/items/353AUUI8?page=76&annotation=E3UHAR8Y)

Entiendo que representa un asset

The asset indexed by 0 is a bank account” Yellow Highlight
[Page 76](zotero://open-pdf/library/items/353AUUI8?page=76&annotation=5JCEJGKD)

{≤locally boundedand predictable.” Yellow Highlight
[Page 76](zotero://open-pdf/library/items/353AUUI8?page=76&annotation=8PQLKCZ8)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-77-x41-y501.png]]

The k-th component φk t of the strategy φt at time t,foreacht,isinterpreted as
the number of units of security k held by an investor at time t.” Yellow
Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=X45TP9EU)

The predictability condition on each φk means that the value φk t is known
immediately before time t. This is done to reduce the investor’s freedom at any
jump time. This issue, however, is not relevant if S has continuous paths (as
happens for example in case S follows a diffusion process)” Purple Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=64SLDQC9)

Moreover, Vt(φ) and Gt(φ) are respectively interpreted as the market value of
the portfolio φt and the cumulative gains realized by the investor until time t
by adopting the strategy φ.” Yellow Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=L8TTNFFJ)

Intuitively, a strategy is self-financing if its value changes only due to
changes in the asset prices. In other words, no additional cash inflows or
outflows occur after the initial time.” Red Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=TWBDCDAK)

Proposition 2.1.1. Let φ be a trading strategy. Then, φ is self-financing if and
only if D(0,t)Vt(φ)=V0(φ)+∫ t 0 φud(D(0,u)Su).” Orange Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=RS6RPR74)

A key result in Harrison and Kreps (1979) and Harrison and Pliska (1981, 1983)
is the established connection between the economic concept of absence of
arbitrage and the mathematical property of existence of a probability measure,
the equivalent martingale measure” Red Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=XFSZBKYU)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-77-x42-y174.png]]

An arbitrage opportunity is defined, in mathematical terms, as a selffinancing
strategy φ such that V0(φ) = 0 but Q0{VT (φ) > 0} > 0. Harrison and Pliska
(1981) then proved the fundamental result that the existence of an equivalent
martingale measure implies the absence of arbitrage opportunities.” Red
Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=WXB55IXY)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-77-x48-y72.png]]

A contingent claim” Yellow Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=FL23QDAK)

A contingent claim H is attainable” Yellow Highlight
[Page 77](zotero://open-pdf/library/items/353AUUI8?page=77&annotation=A7MSDHET)

![[99 - Meta/Attachments/brigoInterestRateModels2006/brigoInterestRateModels2006-78-x53-y505.png]]

When the set of all equivalent martingale measures is nonempty, it is then
possible to derive a unique no-arbitrage price associated to any attainable
contingent claim. Such a price is given by the expectation of the discounted
claim payoff under the measure Q equivalent to Q0” Purple Highlight
[Page 78](zotero://open-pdf/library/items/353AUUI8?page=78&annotation=AGY5JU3B)

Definition 2.1.3. A financial market is complete if and only if every contingent
claim is attainable.” Green Highlight
[Page 78](zotero://open-pdf/library/items/353AUUI8?page=78&annotation=HENWINDP)

We can summarize what stated above by the following well known stylized
characterization of no-arbitrage theory via martingales. • The market is free of
arbitrage if (and only if) there exists a martingale measure; • The market is
complete if and only if the martingale measure is unique; • In an arbitrage-free
market, not necessarily complete, the price of any attainable claim is uniquely
given, either by the value of the associated replicating strategy, or by the
risk neutral expectation of the discounted claim payoff under any of the
equivalent (risk-neutral) martingale measures.” Red Highlight
[Page 78](zotero://open-pdf/library/items/353AUUI8?page=78&annotation=BLBZ52VD)

Formula (2.2) gives the unique no-arbitrage price of an attainable contingent
claim H in terms of the expectation of the claim payoff under the selected
martingale measure Q. Geman et al. (1995) noted, however, that an equivalent
martingale measure Q, as in Definition 2.1.2, is not necessarily the most
natural and convenient measure for pricing the claim H.” Gray Highlight
[Page 78](zotero://open-pdf/library/items/353AUUI8?page=78&annotation=THC24A6M)

the presence of the stochastic discount factor D(t, T ) complicates considerably
the calculation of the expectation. In such cases, a change of measure can be
quite helpful, and this is the approach followed, for instance, by Jamshidian
(1989) in the calculation of a bond-option price under the Vasicek (1977) model”
Gray Highlight
[Page 79](zotero://open-pdf/library/items/353AUUI8?page=79&annotation=AUUVHP8E)

Definition 2.2.1. A numeraire is any positive non-dividend-paying asset.” Green
Highlight
[Page 79](zotero://open-pdf/library/items/353AUUI8?page=79&annotation=GL8TYL79)

Intuitively, a numeraire is a reference asset that is chosen so as to normalize
all other asset prices with respect to it.” Red Highlight
[Page 79](zotero://open-pdf/library/items/353AUUI8?page=79&annotation=FYKM4K3V)

As proven by Geman et al. (1995), Proposition 2.1.1 can be extended to any
numeraire, in that self-financing strategies remain self-financing after a
numeraire change” Yellow Highlight
[Page 79](zotero://open-pdf/library/items/353AUUI8?page=79&annotation=VWZPUMMB)

a useful numeraire is the zero-coupon bondwhose maturity T coincides with that
of the derivative to pric” Yellow Highlight
[Page 90](zotero://open-pdf/library/items/353AUUI8?page=90&annotation=XMG67WPI)

C. A Crash Intro to Stochastic Differential Equations and Poisson Processes”
Orange Highlight
[Page 930](zotero://open-pdf/library/items/353AUUI8?page=930&annotation=XEKJSVNR)

C.1 From Deterministic to Stochastic Differential Equations” Orange Highlight
[Page 930](zotero://open-pdf/library/items/353AUUI8?page=930&annotation=THETVF52)
