//
//  CUTEMapView.m
//  currant
//
//  Created by Foster Yin on 3/26/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapView.h"

@implementation CUTEMapView

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    UIView *calloutMaybe = [self.calloutView hitTest:[self.calloutView convertPoint:point fromView:self] withEvent:event];
    if (calloutMaybe) {
        return calloutMaybe;
    }
    return [super hitTest:point withEvent:event];
}

@end
