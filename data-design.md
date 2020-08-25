# Technical Design

This page describes a technical approach for implementing the data structures and approaches defined during the 18-month project and three international, interdisciplinary Institutes in London, Athens and Umeå.

## Scope

The solutions detailed here are a Proof-of-Concept, designed to be implemented fully at a later date. They are, to an extent agnostic regarding specific software and for the most part employ general principles applicable to graph databases and relational databases to represent the structure.

## Data Types

**Conceptual Object** - in a single graph this represents the enduring concept that persists throughout the the metakinetic pathway. In the case of the Dancing Faun it is used to refer to a mythical persona for which a continuous artistic representation is evident.
*An object which represents a continuous and distinct identity and concept, even allowing for reproduction, modification , and adaptation.*
The *Conceptual Object* receives incoming links from *Instances* as `instance_of`

**Instance** - a specific rendering of a Conceptual Object, e.g. a sketch of a reproduction of the Dancing Faun now in a public collection.
The Instance can recieve 1..n inbound links from *Segments* as `pathway_of`. The *Instance* may also exhibit outbound links to a *Style* as `has_style`.

**Segment** - an event or episode in the metakinetic pathway of the *Conceptual Object* linked to an *Instance* of the Object. In the Dancing Faun example the *Instance* represented by the Pompeii Faun exhibits inbound links from four *Segments* i.e. Creation, Burial, Excavation, and relocation to a museum.
A Segment can also exhibit a link to another Segment indicating its relative chronology as `is_contemporary_to` or `follows_chronologically`.
A Segment can link to a *Location* via the outbound relationships `has_start_location` or `has_end_location`.
A Segment can link to a *LocationType* via the outbound relationship `has_location_type`.
A Segment can link to a *Chronology* via the outbound relationship `has_chronology`.
A Segment can link to an *EventType* via the outbound relationship `has_event_type`.

**Location** - this can be the starting or ending location for the event or episode defined in a segment. The the segment mayhave the same starting and ending location. Multiple locations might be appropriate if the instance is broken into pieces or conversely reassembled from multiple parts. Various gazetteers might provide a URI for an established location. Where possible, a Pleiades ID will also be associated with the Location.

**Chronology** - this is a conceptual temporal timeframe during which the episode represented by the Segment occurred. **Period** is generally used to provide a URI for a Chronology.

**EventTypes** - this is a CIDOC-CRM standard code. A Segment might link to several EventTypes



