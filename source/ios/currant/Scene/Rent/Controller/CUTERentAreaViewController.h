//
//  CUTERentAreaViewController.h
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"
#import "CUTETicket.h"

@interface CUTERentAreaViewController : FXFormViewController

@property (strong, nonatomic) CUTETicket *ticket;

@property (nonatomic, copy) dispatch_block_t updateRentAreaCompletion;



@end
