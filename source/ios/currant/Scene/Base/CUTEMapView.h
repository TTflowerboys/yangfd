//
//  CUTEMapView.h
//  currant
//
//  Created by Foster Yin on 3/26/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <MapKit/MapKit.h>
#import <SMCalloutView.h>

@interface CUTEMapView : MKMapView

@property (strong, nonatomic) SMCalloutView *calloutView;

@end
